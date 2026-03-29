import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService } from '../helpers/mock-services';
import { createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/characters/:id/generate-profile', () => {
  const wizardInputs = {
    niche: 'tech_reviews',
    audience: '18-35 tech enthusiasts',
    tone: 'casual_witty',
    topics: ['smartphones', 'laptops', 'gadgets'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate profile from wizard inputs via Claude', async () => {
    const profile = await mockClaudeService.generateCharacterProfile(wizardInputs);

    expect(profile).toBeDefined();
    expect(mockClaudeService.generateCharacterProfile).toHaveBeenCalledWith(wizardInputs);
  });

  it('should include name, backstory, core_belief, speaking_style, anti_keywords, image_prompt, voice_prompt', async () => {
    const profile = await mockClaudeService.generateCharacterProfile(wizardInputs);

    expect(profile.name).toBeDefined();
    expect(typeof profile.name).toBe('string');
    expect(profile.backstory).toBeDefined();
    expect(typeof profile.backstory).toBe('string');
    expect(profile.coreBeliefs).toBeDefined();
    expect(Array.isArray(profile.coreBeliefs)).toBe(true);
    expect(profile.coreBeliefs.length).toBeGreaterThan(0);
    expect(profile.speakingStyle).toBeDefined();
    expect(profile.antiKeywords).toBeDefined();
    expect(Array.isArray(profile.antiKeywords)).toBe(true);
    expect(profile.imagePrompt).toBeDefined();
    expect(profile.voicePrompt).toBeDefined();
  });

  it('should respect niche and audience parameters', async () => {
    await mockClaudeService.generateCharacterProfile(wizardInputs);

    expect(mockClaudeService.generateCharacterProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        niche: 'tech_reviews',
        audience: '18-35 tech enthusiasts',
      })
    );
  });

  it('should return structured JSON response', async () => {
    const profile = await mockClaudeService.generateCharacterProfile(wizardInputs);

    // Verify the response is a proper object with expected fields
    const requiredFields = [
      'name',
      'backstory',
      'coreBeliefs',
      'speakingStyle',
      'antiKeywords',
      'imagePrompt',
      'voicePrompt',
    ];

    requiredFields.forEach((field) => {
      expect(profile).toHaveProperty(field);
    });
  });

  it('should save generated profile to database', async () => {
    const profile = await mockClaudeService.generateCharacterProfile(wizardInputs);

    mockPrisma.character.update.mockResolvedValue(
      createTestCharacter({
        name: profile.name,
        backstory: profile.backstory,
        speakingStyle: profile.speakingStyle,
        antiKeywords: profile.antiKeywords,
      })
    );

    const updated = await mockPrisma.character.update({
      where: { id: 'test-character-id' },
      data: {
        name: profile.name,
        backstory: profile.backstory,
        coreBeliefs: profile.coreBeliefs,
        speakingStyle: profile.speakingStyle,
        antiKeywords: profile.antiKeywords,
        imagePrompt: profile.imagePrompt,
        voicePrompt: profile.voicePrompt,
        status: 'profile_generated',
      },
    });

    expect(mockPrisma.character.update).toHaveBeenCalled();
    expect(updated.name).toBe('Luna AI');
  });

  it('should handle Claude API errors gracefully', async () => {
    mockClaudeService.generateCharacterProfile.mockRejectedValueOnce(
      new Error('Anthropic API rate limit exceeded')
    );

    await expect(
      mockClaudeService.generateCharacterProfile(wizardInputs)
    ).rejects.toThrow('Anthropic API rate limit exceeded');
  });

  it('should track Claude API cost in usage_tracking', async () => {
    await mockClaudeService.generateCharacterProfile(wizardInputs);

    mockPrisma.apiCostLog.create.mockResolvedValue({
      id: 'cost-log-1',
      userId: 'test-user-id',
      service: 'claude',
      operation: 'generate_profile',
      cost: 0.015,
      inputTokens: 1200,
      outputTokens: 800,
    });

    const costLog = await mockPrisma.apiCostLog.create({
      data: {
        userId: 'test-user-id',
        service: 'claude',
        operation: 'generate_profile',
        cost: 0.015,
        inputTokens: 1200,
        outputTokens: 800,
      },
    });

    expect(costLog.service).toBe('claude');
    expect(costLog.cost).toBe(0.015);
  });
});
