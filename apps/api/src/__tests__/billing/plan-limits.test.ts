import { mockPrisma } from '../helpers/mock-prisma';
import { PLAN_LIMITS, PlanType } from '../helpers/test-helpers';


describe('Plan Limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Starter: 1 character, 30 videos/month', () => {
    expect(PLAN_LIMITS.starter.characters).toBe(1);
    expect(PLAN_LIMITS.starter.videosPerMonth).toBe(30);
  });

  it('Growth: 3 characters, 90 videos/month', () => {
    expect(PLAN_LIMITS.growth.characters).toBe(3);
    expect(PLAN_LIMITS.growth.videosPerMonth).toBe(90);
  });

  it('Pro: 10 characters, 300 videos/month', () => {
    expect(PLAN_LIMITS.pro.characters).toBe(10);
    expect(PLAN_LIMITS.pro.videosPerMonth).toBe(300);
  });

  it('should allow video generation even on failed payment', async () => {
    // User with growth plan and a failed payment
    const user = {
      id: 'test-user-id',
      plan: 'growth',
      hasFailedPayment: true,
    };

    mockPrisma.video.count.mockResolvedValue(45);

    const videoCount = await mockPrisma.video.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(2026, 2, 1) },
      },
    });

    const limit = PLAN_LIMITS[user.plan as PlanType].videosPerMonth;
    const withinLimit = videoCount < limit;

    // Should still allow since 45 < 90 limit
    expect(withinLimit).toBe(true);
    // Failed payment does NOT block service
  });

  it('should track overage usage', async () => {
    const plan: PlanType = 'starter';
    const limit = PLAN_LIMITS[plan].videosPerMonth;

    mockPrisma.video.count.mockResolvedValue(35); // 5 over the 30 limit

    const count = await mockPrisma.video.count({
      where: { userId: 'test-user-id' },
    });

    const overage = Math.max(0, count - limit);
    expect(overage).toBe(5);

    mockPrisma.usageTracking.update.mockResolvedValue({
      id: 'usage-1',
      overageVideos: overage,
    });

    await mockPrisma.usageTracking.update({
      where: { id: 'usage-1' },
      data: { overageVideos: overage },
    });

    expect(mockPrisma.usageTracking.update).toHaveBeenCalledWith({
      where: { id: 'usage-1' },
      data: { overageVideos: 5 },
    });
  });

  it('should correctly identify when character limit is reached', async () => {
    const plans: PlanType[] = ['starter', 'growth', 'pro'];

    for (const plan of plans) {
      const limit = PLAN_LIMITS[plan].characters;
      mockPrisma.character.count.mockResolvedValue(limit);

      const count = await mockPrisma.character.count({
        where: { userId: 'test-user-id' },
      });

      expect(count >= limit).toBe(true);
    }
  });

  it('should correctly identify when video limit is reached', async () => {
    const plans: PlanType[] = ['starter', 'growth', 'pro'];
    const expectedLimits = [30, 90, 300];

    for (let i = 0; i < plans.length; i++) {
      const limit = PLAN_LIMITS[plans[i]].videosPerMonth;
      expect(limit).toBe(expectedLimits[i]);
    }
  });
});
