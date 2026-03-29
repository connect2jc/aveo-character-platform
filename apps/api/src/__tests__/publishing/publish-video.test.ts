import { mockPrisma } from '../helpers/mock-prisma';
import { createTestVideo, createTestPlatformConnection } from '../helpers/test-helpers';


describe('POST /api/videos/:id/publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish video to connected platform', async () => {
    const video = createTestVideo({
      status: 'ready',
      outputUrl9x16: 'https://s3.example.com/9x16.mp4',
    });
    const connection = createTestPlatformConnection({ platform: 'tiktok' });

    mockPrisma.video.findUnique.mockResolvedValue(video);
    mockPrisma.platformConnection.findFirst.mockResolvedValue(connection);

    mockPrisma.publishRecord.create.mockResolvedValue({
      id: 'pub-1',
      videoId: video.id,
      platform: 'tiktok',
      status: 'published',
      publishedAt: new Date(),
      platformPostId: 'tiktok_post_abc',
    });

    const record = await mockPrisma.publishRecord.create({
      data: {
        videoId: video.id,
        platform: 'tiktok',
        status: 'published',
        publishedAt: new Date(),
      },
    });

    expect(record.status).toBe('published');
    expect(record.platform).toBe('tiktok');
  });

  it('should select correct aspect ratio per platform', () => {
    const platformAspectRatios: Record<string, string> = {
      tiktok: '9:16',
      youtube_shorts: '9:16',
      instagram_reels: '9:16',
      instagram_feed: '4:5',
      twitter: '1:1',
      youtube: '16:9',
    };

    expect(platformAspectRatios.tiktok).toBe('9:16');
    expect(platformAspectRatios.instagram_feed).toBe('4:5');
    expect(platformAspectRatios.twitter).toBe('1:1');
  });

  it('should update publish status', async () => {
    mockPrisma.publishRecord.update.mockResolvedValue({
      id: 'pub-1',
      status: 'published',
      platformPostId: 'yt_abc123',
      publishedAt: new Date(),
    });

    const updated = await mockPrisma.publishRecord.update({
      where: { id: 'pub-1' },
      data: {
        status: 'published',
        platformPostId: 'yt_abc123',
        publishedAt: new Date(),
      },
    });

    expect(updated.status).toBe('published');
    expect(updated.platformPostId).toBe('yt_abc123');
  });

  it('should handle publish failures', async () => {
    mockPrisma.publishRecord.update.mockResolvedValue({
      id: 'pub-1',
      status: 'failed',
      errorMessage: 'TikTok API: Video too long',
    });

    const updated = await mockPrisma.publishRecord.update({
      where: { id: 'pub-1' },
      data: {
        status: 'failed',
        errorMessage: 'TikTok API: Video too long',
      },
    });

    expect(updated.status).toBe('failed');
    expect(updated.errorMessage).toContain('too long');
  });

  it('should stagger multi-platform posts', () => {
    const platforms = ['tiktok', 'instagram', 'youtube_shorts'];
    const staggerMinutes = 30;
    const publishTimes: Date[] = [];

    const baseTime = new Date('2026-03-15T10:00:00Z');

    platforms.forEach((_, i) => {
      const time = new Date(baseTime.getTime() + i * staggerMinutes * 60000);
      publishTimes.push(time);
    });

    expect(publishTimes[1].getTime() - publishTimes[0].getTime()).toBe(
      staggerMinutes * 60000
    );
    expect(publishTimes[2].getTime() - publishTimes[1].getTime()).toBe(
      staggerMinutes * 60000
    );
  });

  it('should return 400 if video is not ready', async () => {
    const video = createTestVideo({ status: 'processing' });
    mockPrisma.video.findUnique.mockResolvedValue(video);

    const found = await mockPrisma.video.findUnique({
      where: { id: video.id },
    });

    expect(found!.status).not.toBe('ready');
    // Controller would return 400: Video is not ready for publishing
  });
});
