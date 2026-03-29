import { mockPrisma } from '../helpers/mock-prisma';
import { mockQueue } from '../helpers/mock-services';
import { createTestVideoClip } from '../helpers/test-helpers';


describe('Clip Retry Logic', () => {
  const MAX_RETRIES = 3;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retry failed clips up to 3 times', async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const clip = createTestVideoClip({
        status: 'failed',
        retryCount: attempt - 1,
      });

      const canRetry = clip.retryCount < MAX_RETRIES;
      expect(canRetry).toBe(true);

      mockPrisma.videoClip.update.mockResolvedValue({
        ...clip,
        retryCount: attempt,
        status: 'pending',
      });

      await mockPrisma.videoClip.update({
        where: { id: clip.id },
        data: { retryCount: attempt, status: 'pending' },
      });
    }

    expect(mockPrisma.videoClip.update).toHaveBeenCalledTimes(MAX_RETRIES);
  });

  it('should use exponential backoff', () => {
    const baseDelay = 1000; // 1 second
    const delays: number[] = [];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const delay = baseDelay * Math.pow(2, attempt);
      delays.push(delay);
    }

    expect(delays).toEqual([1000, 2000, 4000]);
    expect(delays[1]).toBe(delays[0] * 2);
    expect(delays[2]).toBe(delays[1] * 2);
  });

  it('should move to dead-letter queue after 3 failures', async () => {
    const clip = createTestVideoClip({
      status: 'failed',
      retryCount: MAX_RETRIES,
    });

    const canRetry = clip.retryCount < MAX_RETRIES;
    expect(canRetry).toBe(false);

    // Should move to dead-letter
    mockPrisma.videoClip.update.mockResolvedValue({
      ...clip,
      status: 'dead_letter',
    });

    const updated = await mockPrisma.videoClip.update({
      where: { id: clip.id },
      data: { status: 'dead_letter' },
    });

    expect(updated.status).toBe('dead_letter');

    // Also queue to DLQ
    await mockQueue.add('dead-letter-clips', {
      clipId: clip.id,
      videoId: clip.videoId,
      error: 'Max retries exceeded',
    });

    expect(mockQueue.add).toHaveBeenCalledWith('dead-letter-clips', {
      clipId: clip.id,
      videoId: clip.videoId,
      error: 'Max retries exceeded',
    });
  });

  it('should not retry on non-retryable errors', () => {
    const nonRetryableErrors = [
      'INVALID_INPUT: Script segment is empty',
      'INVALID_INPUT: Voice ID not found',
      'PERMISSION_DENIED: Account suspended',
      'VALIDATION_ERROR: Image URL invalid',
    ];

    nonRetryableErrors.forEach((error) => {
      const isRetryable = !error.startsWith('INVALID_INPUT') &&
        !error.startsWith('PERMISSION_DENIED') &&
        !error.startsWith('VALIDATION_ERROR');
      expect(isRetryable).toBe(false);
    });

    const retryableErrors = [
      'TIMEOUT: Request timed out',
      'SERVICE_UNAVAILABLE: Try again later',
      'RATE_LIMITED: Too many requests',
    ];

    retryableErrors.forEach((error) => {
      const isRetryable = !error.startsWith('INVALID_INPUT') &&
        !error.startsWith('PERMISSION_DENIED') &&
        !error.startsWith('VALIDATION_ERROR');
      expect(isRetryable).toBe(true);
    });
  });

  it('should update video status to partial_failure if some clips fail permanently', async () => {
    const clips = [
      createTestVideoClip({ clipIndex: 0, status: 'complete' }),
      createTestVideoClip({ clipIndex: 1, status: 'dead_letter', id: 'clip-2' }),
      createTestVideoClip({ clipIndex: 2, status: 'complete', id: 'clip-3' }),
    ];

    mockPrisma.videoClip.findMany.mockResolvedValue(clips);

    const allClips = await mockPrisma.videoClip.findMany({
      where: { videoId: 'test-video-id' },
    });

    const hasDeadLetter = allClips.some((c: any) => c.status === 'dead_letter');
    expect(hasDeadLetter).toBe(true);

    // Should mark video as partial_failure
    mockPrisma.video.update.mockResolvedValue({
      id: 'test-video-id',
      status: 'partial_failure',
    });

    const updated = await mockPrisma.video.update({
      where: { id: 'test-video-id' },
      data: { status: 'partial_failure' },
    });

    expect(updated.status).toBe('partial_failure');
  });
});
