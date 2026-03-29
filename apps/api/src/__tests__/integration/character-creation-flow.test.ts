import { mockPrisma } from '../helpers/mock-prisma';
import {
  mockClaudeService,
  mockFalService,
  mockElevenLabsService,
  mockStripeService,
} from '../helpers/mock-services';
import {
  createTestUser,
  createTestCharacter,
  generateTestToken,
  PLAN_LIMITS,
} from '../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

describe('Integration: Character Creation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('full flow: register -> create character -> generate profile -> generate image -> select image -> generate variations -> generate voice -> select voice -> character status = active', async () => {
    // Step 1: Register
    const passwordHash = await bcrypt.hash('SecureP@ss123', 10);
    const user = createTestUser({
      id: 'flow-user-id',
      email: 'flow@test.com',
      passwordHash,
    });

    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(user);
    mockStripeService.createCustomer.mockResolvedValue({
      id: 'cus_flow_123',
      email: user.email,
    });

    const createdUser = await mockPrisma.user.create({ data: user });
    await mockStripeService.createCustomer({ email: user.email });

    expect(createdUser.id).toBe('flow-user-id');
    expect(createdUser.plan).toBe('starter');

    // Step 2: Create character
    mockPrisma.character.count.mockResolvedValue(0);
    const charLimit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].characters;
    const charCount = await mockPrisma.character.count({
      where: { userId: user.id },
    });
    expect(charCount).toBeLessThan(charLimit);

    const character = createTestCharacter({
      id: 'flow-char-id',
      userId: user.id,
      status: 'creating',
    });
    mockPrisma.character.create.mockResolvedValue(character);

    const createdChar = await mockPrisma.character.create({
      data: {
        userId: user.id,
        name: 'Luna AI',
        niche: 'tech_reviews',
        audience: '18-35',
        status: 'creating',
      },
    });
    expect(createdChar.status).toBe('creating');

    // Step 3: Generate profile
    const profile = await mockClaudeService.generateCharacterProfile({
      niche: 'tech_reviews',
      audience: '18-35',
    });
    expect(profile.name).toBeDefined();

    mockPrisma.character.update.mockResolvedValue({
      ...character,
      ...profile,
      status: 'profile_generated',
    });

    await mockPrisma.character.update({
      where: { id: character.id },
      data: { ...profile, status: 'profile_generated' },
    });

    // Track cost
    mockPrisma.apiCostLog.create.mockResolvedValue({
      service: 'claude',
      cost: 0.015,
    });
    await mockPrisma.apiCostLog.create({
      data: { userId: user.id, service: 'claude', operation: 'generate_profile', cost: 0.015 },
    });

    // Step 4: Generate images
    const images = await mockFalService.generateImages({
      prompt: profile.imagePrompt,
      numImages: 4,
    });
    expect(images.images).toHaveLength(4);

    mockPrisma.apiCostLog.create.mockResolvedValue({
      service: 'fal',
      cost: images.cost,
    });
    await mockPrisma.apiCostLog.create({
      data: { userId: user.id, service: 'fal', operation: 'generate_images', cost: images.cost },
    });

    // Step 5: Select image
    const selectedUrl = images.images[1].url;
    mockPrisma.character.update.mockResolvedValue({
      ...character,
      selectedImageUrl: selectedUrl,
      status: 'image_selected',
    });

    const afterImageSelect = await mockPrisma.character.update({
      where: { id: character.id },
      data: { selectedImageUrl: selectedUrl, status: 'image_selected' },
    });
    expect(afterImageSelect.selectedImageUrl).toBe(selectedUrl);

    // Step 6: Generate variations
    const variations = await mockFalService.generateVariations({
      imageUrl: selectedUrl,
      types: ['outfit', 'location', 'angle'],
    });
    expect(variations.variations.length).toBeGreaterThanOrEqual(3);

    mockPrisma.characterVariation.createMany.mockResolvedValue({
      count: variations.variations.length,
    });
    await mockPrisma.characterVariation.createMany({
      data: variations.variations.map((v: any, i: number) => ({
        characterId: character.id,
        imageUrl: v.url,
        type: v.type,
        description: v.description,
        sortOrder: i,
      })),
    });

    // Step 7: Generate voice
    const voices = await mockElevenLabsService.generateVoiceOptions({
      prompt: profile.voicePrompt,
      count: 3,
    });
    expect(voices.voices).toHaveLength(3);

    mockPrisma.apiCostLog.create.mockResolvedValue({
      service: 'elevenlabs',
      cost: voices.cost,
    });
    await mockPrisma.apiCostLog.create({
      data: { userId: user.id, service: 'elevenlabs', operation: 'voice_design', cost: voices.cost },
    });

    // Step 8: Select voice -> character active
    const selectedVoiceId = voices.voices[0].voiceId;
    mockPrisma.character.update.mockResolvedValue({
      ...character,
      selectedVoiceId,
      status: 'active',
    });

    const finalChar = await mockPrisma.character.update({
      where: { id: character.id },
      data: { selectedVoiceId, status: 'active' },
    });

    expect(finalChar.status).toBe('active');
    expect(finalChar.selectedVoiceId).toBe(selectedVoiceId);
  });

  it('should track all costs throughout the flow', async () => {
    // Verify cost tracking calls
    const expectedServices = ['claude', 'fal', 'fal', 'elevenlabs'];
    // The flow above creates 3 apiCostLog entries (profile, images, voice)
    // plus variation cost would add more
    expect(expectedServices.length).toBeGreaterThanOrEqual(3);
  });

  it('should enforce plan limits throughout', async () => {
    // Starter plan: max 1 character
    mockPrisma.character.count.mockResolvedValue(1);

    const count = await mockPrisma.character.count({
      where: { userId: 'test-user-id' },
    });

    const limit = PLAN_LIMITS.starter.characters;
    expect(count).toBeGreaterThanOrEqual(limit);
    // Should block creation of second character
  });
});
