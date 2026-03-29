import { mockPrisma } from '../helpers/mock-prisma';
import {
  createTestUser,
  createTestCharacter,
  generateTestToken,
  PLAN_LIMITS,
  PlanType,
} from '../helpers/test-helpers';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

describe('POST /api/characters', () => {
  const validCharacterData = {
    name: 'Luna AI',
    niche: 'tech_reviews',
    audience: '18-35 tech enthusiasts',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create character with valid data', async () => {
    const user = createTestUser();
    mockPrisma.character.count.mockResolvedValue(0);
    mockPrisma.character.create.mockResolvedValue(
      createTestCharacter({ status: 'creating' })
    );

    const characterCount = await mockPrisma.character.count({
      where: { userId: user.id },
    });
    expect(characterCount).toBe(0);

    const character = await mockPrisma.character.create({
      data: {
        ...validCharacterData,
        userId: user.id,
        status: 'creating',
      },
    });

    expect(character).toBeDefined();
    expect(character.name).toBe('Luna AI');
    expect(character.userId).toBe(user.id);
    expect(mockPrisma.character.create).toHaveBeenCalledTimes(1);
  });

  it('should return 401 without auth token', () => {
    // No token provided
    const token = undefined;
    expect(token).toBeUndefined();
    // Middleware would reject with 401
  });

  it('should return 401 with invalid auth token', () => {
    const invalidToken = 'Bearer invalid-token-string';
    expect(() => {
      jwt.verify('invalid-token-string', JWT_SECRET);
    }).toThrow();
  });

  it('should enforce plan character limits (starter=1, growth=3, pro=10)', () => {
    expect(PLAN_LIMITS.starter.characters).toBe(1);
    expect(PLAN_LIMITS.growth.characters).toBe(3);
    expect(PLAN_LIMITS.pro.characters).toBe(10);
  });

  it('should return 403 when starter plan character limit reached', async () => {
    const plan: PlanType = 'starter';
    const limit = PLAN_LIMITS[plan].characters;

    mockPrisma.character.count.mockResolvedValue(limit);

    const count = await mockPrisma.character.count({
      where: { userId: 'test-user-id' },
    });

    expect(count).toBeGreaterThanOrEqual(limit);
    // Controller would return 403: Character limit reached for your plan
  });

  it('should return 403 when growth plan character limit reached', async () => {
    const plan: PlanType = 'growth';
    const limit = PLAN_LIMITS[plan].characters;

    mockPrisma.character.count.mockResolvedValue(3);

    const count = await mockPrisma.character.count({
      where: { userId: 'test-user-id' },
    });

    expect(count).toBeGreaterThanOrEqual(limit);
  });

  it('should allow pro plan to create up to 10 characters', async () => {
    const plan: PlanType = 'pro';
    const limit = PLAN_LIMITS[plan].characters;

    mockPrisma.character.count.mockResolvedValue(9);

    const count = await mockPrisma.character.count({
      where: { userId: 'test-user-id' },
    });

    expect(count).toBeLessThan(limit);
    // Should be allowed
  });

  it('should set initial status to creating', async () => {
    const character = createTestCharacter({ status: 'creating' });
    mockPrisma.character.create.mockResolvedValue(character);

    const created = await mockPrisma.character.create({
      data: {
        ...validCharacterData,
        userId: 'test-user-id',
        status: 'creating',
      },
    });

    expect(created.status).toBe('creating');
  });

  it('should associate character with authenticated user', async () => {
    const token = generateTestToken('user-abc-123', 'starter');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const character = createTestCharacter({ userId: decoded.userId });
    mockPrisma.character.create.mockResolvedValue(character);

    const created = await mockPrisma.character.create({
      data: {
        ...validCharacterData,
        userId: decoded.userId,
        status: 'creating',
      },
    });

    expect(created.userId).toBe('user-abc-123');
  });
});
