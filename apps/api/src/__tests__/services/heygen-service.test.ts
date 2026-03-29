import { mockHeyGenService } from '../helpers/mock-services';


describe('HeyGen Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create talking head video', async () => {
    const result = await mockHeyGenService.createTalkingHeadVideo({
      imageUrl: 'https://example.com/character.png',
      audioUrl: 'https://example.com/audio.mp3',
    });

    expect(result.jobId).toBeTruthy();
    expect(result.status).toBe('processing');
    expect(result.estimatedDuration).toBeGreaterThan(0);
  });

  it('should check job status', async () => {
    const status = await mockHeyGenService.checkJobStatus('heygen_job_abc123');

    expect(status.jobId).toBe('heygen_job_abc123');
    expect(status.status).toBe('complete');
    expect(status.videoUrl).toBeTruthy();
    expect(status.durationSeconds).toBeGreaterThan(0);
  });

  it('should return video URL on completion', async () => {
    const result = await mockHeyGenService.getVideoUrl('heygen_job_abc123');

    expect(result.url).toBeTruthy();
    expect(result.url).toMatch(/^https:\/\//);
    expect(result.cost).toBeGreaterThan(0);
  });

  it('should handle processing status (not yet complete)', async () => {
    mockHeyGenService.checkJobStatus.mockResolvedValueOnce({
      jobId: 'heygen_job_def456',
      status: 'processing',
      videoUrl: null,
      progress: 45,
    });

    const status = await mockHeyGenService.checkJobStatus('heygen_job_def456');

    expect(status.status).toBe('processing');
    expect(status.videoUrl).toBeNull();
    expect(status.progress).toBe(45);
  });

  it('should handle API errors', async () => {
    mockHeyGenService.createTalkingHeadVideo.mockRejectedValueOnce(
      new Error('HeyGen: Invalid image format')
    );

    await expect(
      mockHeyGenService.createTalkingHeadVideo({
        imageUrl: 'invalid',
        audioUrl: 'test.mp3',
      })
    ).rejects.toThrow('Invalid image format');
  });

  it('should handle job failure', async () => {
    mockHeyGenService.checkJobStatus.mockResolvedValueOnce({
      jobId: 'heygen_job_fail',
      status: 'failed',
      error: 'Audio too long for selected avatar',
    });

    const status = await mockHeyGenService.checkJobStatus('heygen_job_fail');
    expect(status.status).toBe('failed');
    expect(status.error).toBeTruthy();
  });
});
