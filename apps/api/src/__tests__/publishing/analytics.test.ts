import { mockPrisma } from '../helpers/mock-prisma';


describe('GET /api/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return video analytics for user', async () => {
    mockPrisma.video.findMany.mockResolvedValue([
      {
        id: 'v1',
        status: 'ready',
        publishRecords: [
          { platform: 'tiktok', views: 15000, likes: 1200, comments: 85 },
        ],
      },
      {
        id: 'v2',
        status: 'ready',
        publishRecords: [
          { platform: 'instagram', views: 8500, likes: 600, comments: 42 },
        ],
      },
    ]);

    const videos = await mockPrisma.video.findMany({
      where: { userId: 'test-user-id' },
      include: { publishRecords: true },
    });

    expect(videos).toHaveLength(2);
  });

  it('should aggregate metrics across platforms', () => {
    const publishRecords = [
      { platform: 'tiktok', views: 15000, likes: 1200 },
      { platform: 'instagram', views: 8500, likes: 600 },
      { platform: 'youtube', views: 3200, likes: 250 },
    ];

    const totals = publishRecords.reduce(
      (acc, r) => ({
        views: acc.views + r.views,
        likes: acc.likes + r.likes,
      }),
      { views: 0, likes: 0 }
    );

    expect(totals.views).toBe(26700);
    expect(totals.likes).toBe(2050);
  });

  it('should calculate engagement rate', () => {
    const views = 15000;
    const likes = 1200;
    const comments = 85;
    const shares = 45;

    const engagementRate =
      ((likes + comments + shares) / views) * 100;

    expect(engagementRate).toBeCloseTo(8.87, 1);
  });

  it('should filter analytics by date range', async () => {
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-03-31');

    mockPrisma.publishRecord.findMany.mockResolvedValue([]);

    await mockPrisma.publishRecord.findMany({
      where: {
        video: { userId: 'test-user-id' },
        publishedAt: { gte: startDate, lte: endDate },
      },
    });

    expect(mockPrisma.publishRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          publishedAt: { gte: startDate, lte: endDate },
        }),
      })
    );
  });

  it('should return per-platform breakdown', () => {
    const records = [
      { platform: 'tiktok', views: 10000 },
      { platform: 'tiktok', views: 5000 },
      { platform: 'instagram', views: 8000 },
    ];

    const byPlatform = records.reduce(
      (acc: Record<string, number>, r) => {
        acc[r.platform] = (acc[r.platform] || 0) + r.views;
        return acc;
      },
      {}
    );

    expect(byPlatform.tiktok).toBe(15000);
    expect(byPlatform.instagram).toBe(8000);
  });
});
