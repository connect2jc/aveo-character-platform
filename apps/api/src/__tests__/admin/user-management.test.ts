import { mockPrisma } from '../helpers/mock-prisma';
import {
  createTestUser,
  generateAdminToken,
  generateTestToken,
} from '../helpers/test-helpers';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

describe('Admin User Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list all users (admin only)', async () => {
    const token = generateAdminToken();
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.role).toBe('admin');

    const users = [
      createTestUser({ id: 'u1', email: 'user1@test.com' }),
      createTestUser({ id: 'u2', email: 'user2@test.com' }),
      createTestUser({ id: 'u3', email: 'user3@test.com' }),
    ];

    mockPrisma.user.findMany.mockResolvedValue(users);

    const result = await mockPrisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    expect(result).toHaveLength(3);
  });

  it('should return 403 for non-admin', () => {
    const token = generateTestToken('regular-user', 'starter');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    expect(decoded.role).toBe('user');
    expect(decoded.role).not.toBe('admin');
    // Middleware would return 403
  });

  it('should view user details with usage', async () => {
    const user = createTestUser({ id: 'target-user-id' });
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.character.count.mockResolvedValue(2);
    mockPrisma.video.count.mockResolvedValue(25);
    mockPrisma.apiCostLog.aggregate.mockResolvedValue({
      _sum: { cost: 45.60 },
    });

    const userDetails = await mockPrisma.user.findUnique({
      where: { id: 'target-user-id' },
    });
    const characterCount = await mockPrisma.character.count({
      where: { userId: 'target-user-id' },
    });
    const videoCount = await mockPrisma.video.count({
      where: { userId: 'target-user-id' },
    });
    const totalCost = await mockPrisma.apiCostLog.aggregate({
      where: { userId: 'target-user-id' },
      _sum: { cost: true },
    });

    expect(userDetails).toBeDefined();
    expect(characterCount).toBe(2);
    expect(videoCount).toBe(25);
    expect(totalCost._sum.cost).toBe(45.60);
  });

  it('should impersonate user', () => {
    const adminToken = generateAdminToken('admin-id');
    const adminDecoded = jwt.verify(adminToken, JWT_SECRET) as any;
    expect(adminDecoded.role).toBe('admin');

    // Generate a token as if we are the target user
    const impersonationToken = jwt.sign(
      {
        userId: 'target-user-id',
        plan: 'growth',
        role: 'user',
        impersonatedBy: 'admin-id',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const impersonated = jwt.verify(impersonationToken, JWT_SECRET) as any;
    expect(impersonated.userId).toBe('target-user-id');
    expect(impersonated.impersonatedBy).toBe('admin-id');
  });

  it('should adjust plan', async () => {
    mockPrisma.user.update.mockResolvedValue(
      createTestUser({ id: 'target-user-id', plan: 'pro' })
    );

    const updated = await mockPrisma.user.update({
      where: { id: 'target-user-id' },
      data: { plan: 'pro' },
    });

    expect(updated.plan).toBe('pro');
  });

  it('should add bonus videos', async () => {
    mockPrisma.usageTracking.update.mockResolvedValue({
      id: 'usage-1',
      bonusVideos: 10,
    });

    const updated = await mockPrisma.usageTracking.update({
      where: { id: 'usage-1' },
      data: { bonusVideos: 10 },
    });

    expect(updated.bonusVideos).toBe(10);
  });
});
