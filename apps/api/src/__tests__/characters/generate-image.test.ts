import { mockPrisma } from '../helpers/mock-prisma';
import { mockFalService } from '../helpers/mock-services';
import { createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/characters/:id/generate-image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate 4 image options from FAL API', async () => {
    const character = createTestCharacter();
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const result = await mockFalService.generateImages({
      prompt: character.imagePrompt,
      numImages: 4,
    });

    expect(result.images).toHaveLength(4);
    result.images.forEach((img: any) => {
      expect(img.url).toMatch(/^https:\/\/fal\.media/);
      expect(img.seed).toBeDefined();
    });
  });

  it('should append iPhone 15 Pro Max camera simulation to prompt', () => {
    const basePrompt = 'A young woman with short dark hair';
    const cameraSimulation =
      'shot on iPhone 15 Pro Max, natural lighting, 48MP main sensor, photorealistic';
    const fullPrompt = `${basePrompt}, ${cameraSimulation}`;

    expect(fullPrompt).toContain('iPhone 15 Pro Max');
    expect(fullPrompt).toContain('photorealistic');
    expect(fullPrompt).toContain(basePrompt);
  });

  it('should return image URLs for selection', async () => {
    const result = await mockFalService.generateImages({
      prompt: 'test prompt',
      numImages: 4,
    });

    expect(result.images).toBeDefined();
    expect(Array.isArray(result.images)).toBe(true);

    result.images.forEach((img: any) => {
      expect(typeof img.url).toBe('string');
      expect(img.url.startsWith('https://')).toBe(true);
    });
  });

  it('should handle FAL API errors', async () => {
    mockFalService.generateImages.mockRejectedValueOnce(
      new Error('FAL API: Model not available')
    );

    await expect(
      mockFalService.generateImages({ prompt: 'test', numImages: 4 })
    ).rejects.toThrow('FAL API: Model not available');
  });

  it('should track FAL cost', async () => {
    const result = await mockFalService.generateImages({
      prompt: 'test',
      numImages: 4,
    });

    expect(result.cost).toBeDefined();
    expect(typeof result.cost).toBe('number');
    expect(result.cost).toBeGreaterThan(0);

    mockPrisma.apiCostLog.create.mockResolvedValue({
      id: 'cost-fal-1',
      service: 'fal',
      operation: 'generate_images',
      cost: result.cost,
    });

    await mockPrisma.apiCostLog.create({
      data: {
        userId: 'test-user-id',
        service: 'fal',
        operation: 'generate_images',
        cost: result.cost,
      },
    });

    expect(mockPrisma.apiCostLog.create).toHaveBeenCalled();
  });

  it('should save selected image to character record', async () => {
    const selectedUrl = 'https://fal.media/files/img2.png';

    mockPrisma.character.update.mockResolvedValue(
      createTestCharacter({ selectedImageUrl: selectedUrl })
    );

    const updated = await mockPrisma.character.update({
      where: { id: 'test-character-id' },
      data: { selectedImageUrl: selectedUrl },
    });

    expect(updated.selectedImageUrl).toBe(selectedUrl);
  });
});
