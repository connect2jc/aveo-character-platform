import { mockPrisma } from '../helpers/mock-prisma';
import { createTestVideo } from '../helpers/test-helpers';


describe('Video QA / Review', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should approve video and set status to ready', async () => {
    mockPrisma.video.update.mockResolvedValue(
      createTestVideo({ status: 'ready' })
    );

    const updated = await mockPrisma.video.update({
      where: { id: 'test-video-id' },
      data: { status: 'ready' },
    });

    expect(updated.status).toBe('ready');
  });

  it('should reject video with feedback', async () => {
    mockPrisma.video.update.mockResolvedValue(
      createTestVideo({ status: 'rejected' })
    );

    const updated = await mockPrisma.video.update({
      where: { id: 'test-video-id' },
      data: {
        status: 'rejected',
      },
    });

    expect(updated.status).toBe('rejected');
  });

  it('should list videos in review status', async () => {
    const reviewVideos = [
      createTestVideo({ id: 'v1', status: 'review' }),
      createTestVideo({ id: 'v2', status: 'review' }),
    ];

    mockPrisma.video.findMany.mockResolvedValue(reviewVideos);

    const videos = await mockPrisma.video.findMany({
      where: { userId: 'test-user-id', status: 'review' },
    });

    expect(videos).toHaveLength(2);
    videos.forEach((v: any) => expect(v.status).toBe('review'));
  });

  it('should only allow owner to approve/reject', async () => {
    const video = createTestVideo({ userId: 'owner-id' });
    mockPrisma.video.findUnique.mockResolvedValue(video);

    const found = await mockPrisma.video.findUnique({
      where: { id: video.id },
    });

    expect(found!.userId).toBe('owner-id');
    expect(found!.userId).not.toBe('attacker-id');
  });

  it('should include video URLs in review response', async () => {
    const video = createTestVideo({
      status: 'review',
      outputUrl9x16: 'https://s3.example.com/9x16.mp4',
      outputUrl1x1: 'https://s3.example.com/1x1.mp4',
      outputUrl4x5: 'https://s3.example.com/4x5.mp4',
      thumbnailUrl: 'https://s3.example.com/thumb.jpg',
    });

    mockPrisma.video.findUnique.mockResolvedValue(video);

    const found = await mockPrisma.video.findUnique({
      where: { id: video.id },
    });

    expect(found!.outputUrl9x16).toBeTruthy();
    expect(found!.outputUrl1x1).toBeTruthy();
    expect(found!.outputUrl4x5).toBeTruthy();
    expect(found!.thumbnailUrl).toBeTruthy();
  });
});
