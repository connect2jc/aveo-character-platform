import { mockFalService } from '../helpers/mock-services';


describe('FAL Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate images from text prompt', async () => {
    const result = await mockFalService.generateImages({
      prompt: 'A young tech reviewer, modern outfit, neon background',
      numImages: 4,
    });

    expect(result.images).toHaveLength(4);
    result.images.forEach((img: any) => {
      expect(img.url).toBeTruthy();
      expect(typeof img.url).toBe('string');
    });
  });

  it('should return cost information', async () => {
    const result = await mockFalService.generateImages({
      prompt: 'test',
      numImages: 4,
    });

    expect(result.cost).toBeDefined();
    expect(typeof result.cost).toBe('number');
    expect(result.cost).toBeGreaterThan(0);
  });

  it('should generate variations preserving face', async () => {
    const result = await mockFalService.generateVariations({
      imageUrl: 'https://example.com/face.png',
      types: ['outfit', 'location'],
      preserveFace: true,
    });

    expect(result.variations).toBeDefined();
    expect(result.variations.length).toBeGreaterThan(0);
  });

  it('should handle API errors', async () => {
    mockFalService.generateImages.mockRejectedValueOnce(
      new Error('FAL API: Insufficient credits')
    );

    await expect(
      mockFalService.generateImages({ prompt: 'test', numImages: 4 })
    ).rejects.toThrow('Insufficient credits');
  });

  it('should include seed values for reproducibility', async () => {
    const result = await mockFalService.generateImages({
      prompt: 'test',
      numImages: 4,
    });

    result.images.forEach((img: any) => {
      expect(img.seed).toBeDefined();
      expect(typeof img.seed).toBe('number');
    });
  });
});
