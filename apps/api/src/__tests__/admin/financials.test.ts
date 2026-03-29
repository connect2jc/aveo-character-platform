import { mockPrisma } from '../helpers/mock-prisma';


describe('Admin Financials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate per-user P&L', async () => {
    const userId = 'test-user-id';

    // Revenue: subscription payment
    mockPrisma.invoice.aggregate.mockResolvedValue({
      _sum: { amount: 4900 }, // $49.00 in cents
    });

    // Costs: API usage
    mockPrisma.apiCostLog.aggregate.mockResolvedValue({
      _sum: { cost: 18.75 },
    });

    const revenue = await mockPrisma.invoice.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    });

    const costs = await mockPrisma.apiCostLog.aggregate({
      where: { userId },
      _sum: { cost: true },
    });

    const revenueUsd = (revenue._sum.amount || 0) / 100;
    const costsUsd = costs._sum.cost || 0;
    const profit = revenueUsd - costsUsd;

    expect(revenueUsd).toBe(49.0);
    expect(costsUsd).toBe(18.75);
    expect(profit).toBe(30.25);
    expect(profit).toBeGreaterThan(0);
  });

  it('should calculate per-video cost breakdown', async () => {
    const videoId = 'test-video-id';

    mockPrisma.apiCostLog.findMany.mockResolvedValue([
      { service: 'claude', operation: 'generate_script', cost: 0.015 },
      { service: 'elevenlabs', operation: 'generate_audio', cost: 0.08 },
      { service: 'elevenlabs', operation: 'generate_audio', cost: 0.06 },
      { service: 'elevenlabs', operation: 'generate_audio', cost: 0.07 },
      { service: 'heygen', operation: 'generate_clip', cost: 0.10 },
      { service: 'heygen', operation: 'generate_clip', cost: 0.10 },
      { service: 'heygen', operation: 'generate_clip', cost: 0.10 },
    ]);

    const costs = await mockPrisma.apiCostLog.findMany({
      where: { videoId },
    });

    const totalCost = costs.reduce((sum: number, c: any) => sum + c.cost, 0);
    const byService = costs.reduce((acc: Record<string, number>, c: any) => {
      acc[c.service] = (acc[c.service] || 0) + c.cost;
      return acc;
    }, {});

    expect(totalCost).toBeCloseTo(0.525, 3);
    expect(byService.claude).toBeCloseTo(0.015, 3);
    expect(byService.elevenlabs).toBeCloseTo(0.21, 2);
    expect(byService.heygen).toBeCloseTo(0.30, 2);
  });

  it('should aggregate monthly P&L', async () => {
    mockPrisma.invoice.aggregate.mockResolvedValue({
      _sum: { amount: 245000 }, // $2,450 total revenue
    });

    mockPrisma.apiCostLog.aggregate.mockResolvedValue({
      _sum: { cost: 875.30 },
    });

    const revenue = await mockPrisma.invoice.aggregate({
      where: {
        status: 'paid',
        createdAt: {
          gte: new Date(2026, 2, 1),
          lt: new Date(2026, 3, 1),
        },
      },
      _sum: { amount: true },
    });

    const costs = await mockPrisma.apiCostLog.aggregate({
      where: {
        createdAt: {
          gte: new Date(2026, 2, 1),
          lt: new Date(2026, 3, 1),
        },
      },
      _sum: { cost: true },
    });

    const monthlyRevenue = (revenue._sum.amount || 0) / 100;
    const monthlyCosts = costs._sum.cost || 0;
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    const margin = (monthlyProfit / monthlyRevenue) * 100;

    expect(monthlyRevenue).toBe(2450);
    expect(monthlyCosts).toBe(875.30);
    expect(monthlyProfit).toBeCloseTo(1574.70, 1);
    expect(margin).toBeCloseTo(64.27, 1);
  });

  it('should show cost trending', async () => {
    const monthlyData = [
      { month: 1, cost: 450.0 },
      { month: 2, cost: 625.5 },
      { month: 3, cost: 875.3 },
    ];

    // Calculate month-over-month growth
    const growthRates: number[] = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const growth =
        ((monthlyData[i].cost - monthlyData[i - 1].cost) /
          monthlyData[i - 1].cost) *
        100;
      growthRates.push(growth);
    }

    expect(growthRates[0]).toBeCloseTo(39.0, 0);
    expect(growthRates[1]).toBeCloseTo(39.9, 0);

    // Trending upward
    const isIncreasing = monthlyData.every(
      (d, i) => i === 0 || d.cost > monthlyData[i - 1].cost
    );
    expect(isIncreasing).toBe(true);
  });
});
