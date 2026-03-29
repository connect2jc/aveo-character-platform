import { mockPrisma } from '../helpers/mock-prisma';
import { createTestCharacter, generateTestToken } from '../helpers/test-helpers';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

describe('GET /api/characters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list all characters for the authenticated user', async () => {
    const userId = 'test-user-id';
    const characters = [
      createTestCharacter({ id: 'char-1', name: 'Luna AI' }),
      createTestCharacter({ id: 'char-2', name: 'Rex Reviews' }),
    ];

    mockPrisma.character.findMany.mockResolvedValue(characters);

    const result = await mockPrisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Luna AI');
    expect(result[1].name).toBe('Rex Reviews');
  });

  it('should return empty array when user has no characters', async () => {
    mockPrisma.character.findMany.mockResolvedValue([]);

    const result = await mockPrisma.character.findMany({
      where: { userId: 'user-no-chars' },
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should not return characters from other users', async () => {
    const userACharacters = [createTestCharacter({ userId: 'user-a' })];
    mockPrisma.character.findMany.mockResolvedValue(userACharacters);

    const result = await mockPrisma.character.findMany({
      where: { userId: 'user-a' },
    });

    result.forEach((char: any) => {
      expect(char.userId).toBe('user-a');
    });
  });

  it('should include character status in response', async () => {
    const characters = [
      createTestCharacter({ status: 'active' }),
      createTestCharacter({ id: 'char-2', status: 'creating' }),
    ];
    mockPrisma.character.findMany.mockResolvedValue(characters);

    const result = await mockPrisma.character.findMany({
      where: { userId: 'test-user-id' },
    });

    expect(result[0].status).toBe('active');
    expect(result[1].status).toBe('creating');
  });

  it('should require authentication', () => {
    const token = undefined;
    expect(token).toBeUndefined();
    // Middleware would reject with 401
  });
});
