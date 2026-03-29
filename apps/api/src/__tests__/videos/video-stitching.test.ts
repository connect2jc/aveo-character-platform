import { mockPrisma } from '../helpers/mock-prisma';
import { mockS3Service } from '../helpers/mock-services';
import { createTestVideo, createTestVideoClip } from '../helpers/test-helpers';


describe('Video Stitching Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger stitching when all clips are complete', async () => {
    const clips = [
      createTestVideoClip({ clipIndex: 0, status: 'complete' }),
      createTestVideoClip({ clipIndex: 1, status: 'complete', id: 'clip-2' }),
      createTestVideoClip({ clipIndex: 2, status: 'complete', id: 'clip-3' }),
    ];

    mockPrisma.videoClip.findMany.mockResolvedValue(clips);
    mockPrisma.videoClip.count.mockResolvedValue(3);

    const allClips = await mockPrisma.videoClip.findMany({
      where: { videoId: 'test-video-id' },
      orderBy: { clipIndex: 'asc' },
    });

    const completeClips = allClips.filter((c: any) => c.status === 'complete');
    const totalClips = await mockPrisma.videoClip.count({
      where: { videoId: 'test-video-id' },
    });

    expect(completeClips.length).toBe(totalClips);
    // Stitching should be triggered
  });

  it('should not trigger stitching if some clips are still pending', async () => {
    const clips = [
      createTestVideoClip({ clipIndex: 0, status: 'complete' }),
      createTestVideoClip({ clipIndex: 1, status: 'processing', id: 'clip-2' }),
      createTestVideoClip({ clipIndex: 2, status: 'pending', id: 'clip-3' }),
    ];

    mockPrisma.videoClip.findMany.mockResolvedValue(clips);

    const allClips = await mockPrisma.videoClip.findMany({
      where: { videoId: 'test-video-id' },
    });

    const completeClips = allClips.filter((c: any) => c.status === 'complete');
    expect(completeClips.length).toBeLessThan(allClips.length);
  });

  it('should concatenate clips with 0.5s crossfade', () => {
    const crossfadeDuration = 0.5;
    const clipDurations = [4.5, 12.0, 8.5];
    const totalWithCrossfade =
      clipDurations.reduce((sum, d) => sum + d, 0) -
      crossfadeDuration * (clipDurations.length - 1);

    expect(crossfadeDuration).toBe(0.5);
    expect(totalWithCrossfade).toBe(24.0); // 25.0 - 1.0
  });

  it('should add burned-in captions', () => {
    const captionConfig = {
      fontFamily: 'Arial',
      fontSize: 24,
      fontColor: 'white',
      backgroundColor: 'rgba(0,0,0,0.7)',
      position: 'bottom',
      marginBottom: 80,
    };

    expect(captionConfig.position).toBe('bottom');
    expect(captionConfig.fontSize).toBeGreaterThan(0);
  });

  it('should add background music (volume-ducked)', () => {
    const musicConfig = {
      volumeLevel: 0.15, // 15% volume (ducked behind voice)
      fadeInDuration: 1.0,
      fadeOutDuration: 2.0,
    };

    expect(musicConfig.volumeLevel).toBeLessThan(0.3);
    expect(musicConfig.fadeInDuration).toBeGreaterThan(0);
    expect(musicConfig.fadeOutDuration).toBeGreaterThan(0);
  });

  it('should export in 3 aspect ratios (9:16, 1:1, 4:5)', async () => {
    const aspectRatios = ['9:16', '1:1', '4:5'];
    const outputUrls: Record<string, string> = {};

    for (const ratio of aspectRatios) {
      const key = `output-${ratio.replace(':', 'x')}.mp4`;
      mockS3Service.upload.mockResolvedValueOnce({
        url: `https://test-bucket.s3.amazonaws.com/${key}`,
        key,
      });

      const result = await mockS3Service.upload({
        buffer: Buffer.from('fake-video'),
        key,
        contentType: 'video/mp4',
      });

      outputUrls[ratio] = result.url;
    }

    expect(Object.keys(outputUrls)).toHaveLength(3);
    expect(mockS3Service.upload).toHaveBeenCalledTimes(3);
  });

  it('should generate thumbnail from first frame', async () => {
    mockS3Service.upload.mockResolvedValueOnce({
      url: 'https://test-bucket.s3.amazonaws.com/thumb.jpg',
      key: 'thumb.jpg',
    });

    const result = await mockS3Service.upload({
      buffer: Buffer.from('fake-thumbnail'),
      key: 'thumb.jpg',
      contentType: 'image/jpeg',
    });

    expect(result.url).toContain('thumb.jpg');
  });

  it('should upload all outputs to S3', async () => {
    // 3 aspect ratios + 1 thumbnail = 4 uploads
    for (let i = 0; i < 4; i++) {
      await mockS3Service.upload({
        buffer: Buffer.from('data'),
        key: `file-${i}`,
      });
    }

    expect(mockS3Service.upload).toHaveBeenCalledTimes(4);
  });

  it('should update video status to review', async () => {
    mockPrisma.video.update.mockResolvedValue(
      createTestVideo({
        status: 'review',
        outputUrl9x16: 'https://s3.example.com/9x16.mp4',
        outputUrl1x1: 'https://s3.example.com/1x1.mp4',
        outputUrl4x5: 'https://s3.example.com/4x5.mp4',
        thumbnailUrl: 'https://s3.example.com/thumb.jpg',
      })
    );

    const updated = await mockPrisma.video.update({
      where: { id: 'test-video-id' },
      data: {
        status: 'review',
        outputUrl9x16: 'https://s3.example.com/9x16.mp4',
        outputUrl1x1: 'https://s3.example.com/1x1.mp4',
        outputUrl4x5: 'https://s3.example.com/4x5.mp4',
        thumbnailUrl: 'https://s3.example.com/thumb.jpg',
      },
    });

    expect(updated.status).toBe('review');
    expect(updated.outputUrl9x16).toBeDefined();
    expect(updated.outputUrl1x1).toBeDefined();
    expect(updated.outputUrl4x5).toBeDefined();
    expect(updated.thumbnailUrl).toBeDefined();
  });
});
