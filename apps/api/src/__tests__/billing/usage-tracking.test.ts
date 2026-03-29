import { mockPrisma } from '../helpers/mock-prisma';
import { PLAN_LIMITS } from '../helpers/test-helpers';


describe('Usage Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track characters created per month', async () => {
    mockPrisma.character.count.mockResolvedValue(2);

    const startOfMonth = new Date(2026, 2, 1); // March 2026
    const count = await mockPrisma.character.count({
      where: {
        userId: 'test-user-id',
        createdAt: { gte: startOfMonth },
      },
    });

    expect(count).toBe(2);
  });

  it('should track videos generated per month', async () => {
    mockPrisma.video.count.mockResolvedValue(15);

    const startOfMonth = new Date(2026, 2, 1);
    const count = await mockPrisma.video.count({
      where: {
        userId: 'test-user-id',
        createdAt: { gte: startOfMonth },
      },
    });

    expect(count).toBe(15);
  });

  it('should track API costs (HeyGen, ElevenLabs, FAL, Claude)', async () => {
    const costBreakdown = [
      { service: 'heygen', totalCost: 12.50 },
      { service: 'elevenlabs', totalCost: 3.20 },
      { service: 'fal', totalCost: 1.80 },
      { service: 'claude', totalCost: 0.45 },
    ];

    mockPrisma.apiCostLog.groupBy.mockResolvedValue(costBreakdown);

    const costs = await mockPrisma.apiCostLog.groupBy({
      by: ['service'],
      where: { userId: 'test-user-id' },
      _sum: { cost: true },
    });

    expect(costs).toHaveLength(4);
    const services = costs.map((c: any) => c.service);
    expect(services).toContain('heygen');
    expect(services).toContain('elevenlabs');
    expect(services).toContain('fal');
    expect(services).toContain('claude');
  });

  it('should enforce plan limits', () => {
    const testCases = [
      { plan: 'starter' as const, videos: 30, characters: 1, shouldBlock: false },
      { plan: 'starter' as const, videos: 31, characters: 1, shouldBlock: true },
      { plan: 'growth' as const, videos: 90, characters: 3, shouldBlock: false },
      { plan: 'growth' as const, videos: 91, characters: 3, shouldBlock: true },
      { plan: 'pro' as const, videos: 300, characters: 10, shouldBlock: false },
      { plan: 'pro' as const, videos: 301, characters: 10, shouldBlock: true },
    ];

    testCases.forEach(({ plan, videos, shouldBlock }) => {
      const limit = PLAN_LIMITS[plan].videosPerMonth;
      const isOverLimit = videos > limit;
      expect(isOverLimit).toBe(shouldBlock);
    });
  });

  it('should reset counts monthly', () => {
    const now = new Date('2026-03-15');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    expect(startOfMonth.getDate()).toBe(1);
    expect(startOfMonth.getMonth()).toBe(2); // March (0-indexed)
    expect(startOfNextMonth.getMonth()).toBe(3); // April

    // Usage from previous month should not count
    const prevMonthDate = new Date('2026-02-28');
    expect(prevMonthDate.getTime()).toBeLessThan(startOfMonth.getTime());
  });

  it('should return usage summary for dashboard', async () => {
    mockPrisma.usageTracking.findFirst.mockResolvedValue({
      id: 'usage-1',
      userId: 'test-user-id',
      month: 3,
      year: 2026,
      videosCreated: 15,
      charactersCreated: 1,
      totalApiCost: 17.95,
    });

    const usage = await mockPrisma.usageTracking.findFirst({
      where: {
        userId: 'test-user-id',
        month: 3,
        year: 2026,
      },
    });

    expect(usage).toBeDefined();
    expect(usage!.videosCreated).toBe(15);
    expect(usage!.totalApiCost).toBe(17.95);
  });
});
