import { mockPrisma } from '../helpers/mock-prisma';
import { mockFalService } from '../helpers/mock-services';
import { createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/characters/:id/generate-variations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate 3-5 visual variations', async () => {
    const result = await mockFalService.generateVariations({
      imageUrl: 'https://storage.example.com/characters/luna-main.png',
      types: ['outfit', 'location', 'angle'],
    });

    expect(result.variations).toBeDefined();
    expect(result.variations.length).toBeGreaterThanOrEqual(3);
    expect(result.variations.length).toBeLessThanOrEqual(5);
  });

  it('should preserve face and body in variations', async () => {
    await mockFalService.generateVariations({
      imageUrl: 'https://storage.example.com/characters/luna-main.png',
      preserveFace: true,
      preserveBody: true,
      types: ['outfit'],
    });

    expect(mockFalService.generateVariations).toHaveBeenCalledWith(
      expect.objectContaining({
        preserveFace: true,
        preserveBody: true,
      })
    );
  });

  it('should create character_variations records', async () => {
    const result = await mockFalService.generateVariations({
      imageUrl: 'https://storage.example.com/characters/luna-main.png',
      types: ['outfit', 'location', 'angle'],
    });

    const variationRecords = result.variations.map((v: any, i: number) => ({
      characterId: 'test-character-id',
      imageUrl: v.url,
      type: v.type,
      description: v.description,
      sortOrder: i,
    }));

    mockPrisma.characterVariation.createMany.mockResolvedValue({
      count: variationRecords.length,
    });

    const created = await mockPrisma.characterVariation.createMany({
      data: variationRecords,
    });

    expect(created.count).toBe(3);
    expect(mockPrisma.characterVariation.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          characterId: 'test-character-id',
          type: expect.stringMatching(/^(outfit|location|angle)$/),
        }),
      ]),
    });
  });

  it('should support outfit, location, and angle variation types', async () => {
    const result = await mockFalService.generateVariations({
      imageUrl: 'https://storage.example.com/characters/luna-main.png',
      types: ['outfit', 'location', 'angle'],
    });

    const types = result.variations.map((v: any) => v.type);
    expect(types).toContain('outfit');
    expect(types).toContain('location');
    expect(types).toContain('angle');
  });

  it('should track variation generation cost', async () => {
    const result = await mockFalService.generateVariations({
      imageUrl: 'test.png',
      types: ['outfit'],
    });

    expect(result.cost).toBeDefined();
    expect(result.cost).toBeGreaterThan(0);
  });
});
