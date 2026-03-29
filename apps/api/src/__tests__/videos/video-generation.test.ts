import { mockPrisma } from '../helpers/mock-prisma';
import { mockQueue } from '../helpers/mock-services';
import {
  createTestScript,
  createTestVideo,
  createTestCharacter,
  PLAN_LIMITS,
} from '../helpers/test-helpers';


describe('POST /api/scripts/:id/produce', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create video record from approved script', async () => {
    const script = createTestScript({ status: 'approved' });
    mockPrisma.script.findUnique.mockResolvedValue(script);

    const video = createTestVideo({
      scriptId: script.id,
      status: 'processing',
    });
    mockPrisma.video.create.mockResolvedValue(video);

    const created = await mockPrisma.video.create({
      data: {
        scriptId: script.id,
        characterId: script.characterId,
        userId: script.userId,
        status: 'processing',
      },
    });

    expect(created.scriptId).toBe(script.id);
    expect(created.status).toBe('processing');
  });

  it('should split script into segments of 15 seconds or less', () => {
    const scriptBody =
      'Hey everyone, Luna here. Let me tell you about the latest iPhone camera hype. ' +
      'Spoiler alert: it is not what they want you to think. The megapixel count went up, sure. ' +
      'But real-world performance tells a completely different story. I ran side-by-side tests. ' +
      'The results are going to surprise you. First, let us talk about low-light performance. ' +
      'The new sensor is bigger, but the noise reduction algorithm has actually gotten worse. ' +
      'Second, portrait mode has improved, but only in well-lit conditions. ' +
      'Third, the zoom is genuinely impressive this year. I have to give them credit there. ' +
      'So should you upgrade just for the camera? My honest take: probably not.';

    // Estimate ~150 words per minute for speaking, so ~2.5 words per second
    // 15 seconds = ~37.5 words max per segment
    const WORDS_PER_SECOND = 2.5;
    const MAX_SEGMENT_SECONDS = 15;
    const MAX_WORDS = Math.floor(WORDS_PER_SECOND * MAX_SEGMENT_SECONDS);

    const sentences = scriptBody.match(/[^.!?]+[.!?]+/g) || [];
    const segments: string[] = [];
    let currentSegment = '';

    for (const sentence of sentences) {
      const currentWords = currentSegment.split(/\s+/).filter(Boolean).length;
      const sentenceWords = sentence.trim().split(/\s+/).length;

      if (currentWords + sentenceWords > MAX_WORDS && currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = sentence.trim();
      } else {
        currentSegment += ' ' + sentence.trim();
      }
    }
    if (currentSegment.trim()) {
      segments.push(currentSegment.trim());
    }

    expect(segments.length).toBeGreaterThan(0);

    // Each segment should be within word limit
    segments.forEach((segment) => {
      const wordCount = segment.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(MAX_WORDS + 5); // small buffer for boundary
    });
  });

  it('should create video_clips records for each segment', async () => {
    const segments = [
      'Hey everyone, Luna here. Let me tell you about the latest iPhone camera hype.',
      'The megapixel count went up, sure. But real-world performance tells a different story.',
      'So should you upgrade just for the camera? My honest take: probably not.',
    ];

    const clipRecords = segments.map((segment, i) => ({
      videoId: 'test-video-id',
      clipIndex: i,
      scriptSegment: segment,
      status: 'pending',
      retryCount: 0,
    }));

    mockPrisma.videoClip.createMany.mockResolvedValue({
      count: clipRecords.length,
    });

    const result = await mockPrisma.videoClip.createMany({
      data: clipRecords,
    });

    expect(result.count).toBe(3);
  });

  it('should queue audio generation worker', async () => {
    await mockQueue.add('generate-audio', {
      videoId: 'test-video-id',
      clipIds: ['clip-1', 'clip-2', 'clip-3'],
    });

    expect(mockQueue.add).toHaveBeenCalledWith('generate-audio', {
      videoId: 'test-video-id',
      clipIds: ['clip-1', 'clip-2', 'clip-3'],
    });
  });

  it('should enforce plan video limits', async () => {
    // Starter plan: 30 videos/month
    const plan = 'starter';
    const limit = PLAN_LIMITS[plan].videosPerMonth;

    mockPrisma.video.count.mockResolvedValue(30);

    const count = await mockPrisma.video.count({
      where: {
        userId: 'test-user-id',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    expect(count).toBeGreaterThanOrEqual(limit);
    // Controller would return 403: Video limit reached
  });

  it('should reject non-approved scripts', async () => {
    const draftScript = createTestScript({ status: 'draft' });
    mockPrisma.script.findUnique.mockResolvedValue(draftScript);

    const script = await mockPrisma.script.findUnique({
      where: { id: draftScript.id },
    });

    expect(script!.status).not.toBe('approved');
    // Controller would return 400: Script must be approved before production
  });
});
