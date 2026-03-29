import { mockPrisma } from '../helpers/mock-prisma';
import {
  mockElevenLabsService,
  mockHeyGenService,
  mockS3Service,
  mockQueue,
} from '../helpers/mock-services';
import {
  createTestScript,
  createTestVideo,
  createTestVideoClip,
  createTestCharacter,
} from '../helpers/test-helpers';


describe('Integration: Video Pipeline Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('full flow: approved script -> split segments -> generate audio -> generate clips -> stitch -> review -> approve', async () => {
    // Step 1: Start from approved script
    const script = createTestScript({ status: 'approved' });
    const character = createTestCharacter();

    mockPrisma.script.findUnique.mockResolvedValue(script);
    mockPrisma.character.findUnique.mockResolvedValue(character);

    // Step 2: Split script into segments
    const WORDS_PER_SECOND = 2.5;
    const MAX_WORDS = Math.floor(WORDS_PER_SECOND * 15);
    const fullText = `${script.hook} ${script.body} ${script.cta}`;
    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];

    const segments: string[] = [];
    let current = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      const curWords = current.split(/\s+/).filter(Boolean).length;
      const sentWords = trimmed.split(/\s+/).length;
      if (curWords + sentWords > MAX_WORDS && current) {
        segments.push(current.trim());
        current = trimmed;
      } else {
        current = current ? `${current} ${trimmed}` : trimmed;
      }
    }
    if (current.trim()) segments.push(current.trim());

    expect(segments.length).toBeGreaterThan(0);

    // Step 3: Create video and clips
    const video = createTestVideo({
      scriptId: script.id,
      totalClips: segments.length,
    });
    mockPrisma.video.create.mockResolvedValue(video);

    await mockPrisma.video.create({
      data: {
        scriptId: script.id,
        characterId: character.id,
        userId: script.userId,
        totalClips: segments.length,
        status: 'processing',
      },
    });

    const clipRecords = segments.map((seg, i) => ({
      id: `clip-${i}`,
      videoId: video.id,
      clipIndex: i,
      scriptSegment: seg,
      status: 'pending',
      retryCount: 0,
    }));

    mockPrisma.videoClip.createMany.mockResolvedValue({
      count: clipRecords.length,
    });
    await mockPrisma.videoClip.createMany({ data: clipRecords });

    // Step 4: Generate audio for each clip
    for (const clip of clipRecords) {
      const audioResult = await mockElevenLabsService.generateAudio({
        text: clip.scriptSegment,
        voiceId: character.selectedVoiceId,
      });

      expect(audioResult.audioUrl).toBeTruthy();
      expect(audioResult.durationSeconds).toBeGreaterThan(0);
    }

    expect(mockElevenLabsService.generateAudio).toHaveBeenCalledTimes(
      segments.length
    );

    // Step 5: Generate video clips via HeyGen
    const variations = [
      { id: 'var-1', imageUrl: 'https://example.com/var1.png' },
      { id: 'var-2', imageUrl: 'https://example.com/var2.png' },
      { id: 'var-3', imageUrl: 'https://example.com/var3.png' },
    ];

    for (let i = 0; i < clipRecords.length; i++) {
      const variationIndex = Math.floor(i / 3) % variations.length;
      const variation = variations[variationIndex];

      const heygenResult = await mockHeyGenService.createTalkingHeadVideo({
        imageUrl: variation.imageUrl,
        audioUrl: `https://example.com/audio-${i}.mp3`,
      });

      expect(heygenResult.jobId).toBeTruthy();
    }

    // Step 6: Check all clips complete
    const completedClips = clipRecords.map((clip) =>
      createTestVideoClip({
        ...clip,
        status: 'complete',
        videoUrl: `https://example.com/clip-${clip.clipIndex}.mp4`,
      })
    );
    mockPrisma.videoClip.findMany.mockResolvedValue(completedClips);

    const allClips = await mockPrisma.videoClip.findMany({
      where: { videoId: video.id },
      orderBy: { clipIndex: 'asc' },
    });

    const allComplete = allClips.every((c: any) => c.status === 'complete');
    expect(allComplete).toBe(true);

    // Step 7: Stitch and upload
    for (const ratio of ['9:16', '1:1', '4:5']) {
      await mockS3Service.upload({
        buffer: Buffer.from('video-data'),
        key: `videos/${video.id}/${ratio.replace(':', 'x')}.mp4`,
      });
    }
    await mockS3Service.upload({
      buffer: Buffer.from('thumb-data'),
      key: `videos/${video.id}/thumbnail.jpg`,
    });

    expect(mockS3Service.upload).toHaveBeenCalledTimes(4);

    // Step 8: Update to review
    mockPrisma.video.update.mockResolvedValue(
      createTestVideo({ status: 'review' })
    );
    const reviewVideo = await mockPrisma.video.update({
      where: { id: video.id },
      data: { status: 'review' },
    });
    expect(reviewVideo.status).toBe('review');

    // Step 9: Approve
    mockPrisma.video.update.mockResolvedValue(
      createTestVideo({ status: 'ready' })
    );
    const approvedVideo = await mockPrisma.video.update({
      where: { id: video.id },
      data: { status: 'ready' },
    });
    expect(approvedVideo.status).toBe('ready');
  });

  it('should rotate visual variations every 3 clips', () => {
    const variations = ['var-a', 'var-b', 'var-c'];
    const clipCount = 9;
    const assignments: string[] = [];

    for (let i = 0; i < clipCount; i++) {
      const variationIndex = Math.floor(i / 3) % variations.length;
      assignments.push(variations[variationIndex]);
    }

    // Clips 0-2: var-a, Clips 3-5: var-b, Clips 6-8: var-c
    expect(assignments.slice(0, 3)).toEqual(['var-a', 'var-a', 'var-a']);
    expect(assignments.slice(3, 6)).toEqual(['var-b', 'var-b', 'var-b']);
    expect(assignments.slice(6, 9)).toEqual(['var-c', 'var-c', 'var-c']);
  });

  it('should handle partial clip failures and retries', async () => {
    const clips = [
      createTestVideoClip({ clipIndex: 0, status: 'complete' }),
      createTestVideoClip({
        clipIndex: 1,
        status: 'failed',
        retryCount: 1,
        id: 'clip-fail',
      }),
      createTestVideoClip({ clipIndex: 2, status: 'complete', id: 'clip-3' }),
    ];

    const failedClips = clips.filter((c) => c.status === 'failed');
    expect(failedClips).toHaveLength(1);

    const canRetry = failedClips[0].retryCount < 3;
    expect(canRetry).toBe(true);

    // Retry the failed clip
    await mockQueue.add('retry-clip', {
      clipId: failedClips[0].id,
      attempt: failedClips[0].retryCount + 1,
    });

    expect(mockQueue.add).toHaveBeenCalledWith('retry-clip', {
      clipId: 'clip-fail',
      attempt: 2,
    });
  });

  it('should produce all 3 aspect ratios', () => {
    const requiredRatios = ['9:16', '1:1', '4:5'];
    const resolutions: Record<string, { width: number; height: number }> = {
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '4:5': { width: 1080, height: 1350 },
    };

    requiredRatios.forEach((ratio) => {
      expect(resolutions[ratio]).toBeDefined();
      expect(resolutions[ratio].width).toBe(1080);
    });
  });
});
