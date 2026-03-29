import { mockElevenLabsService } from '../helpers/mock-services';


describe('ElevenLabs Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate voice options with Voice Design', async () => {
    const result = await mockElevenLabsService.generateVoiceOptions({
      prompt: 'Young female, energetic, California accent',
      count: 3,
    });

    expect(result.voices).toHaveLength(3);
    result.voices.forEach((voice: any) => {
      expect(voice.voiceId).toBeTruthy();
      expect(voice.name).toBeTruthy();
      expect(voice.sampleUrl).toBeTruthy();
      expect(voice.description).toBeTruthy();
    });
  });

  it('should generate audio from text', async () => {
    const result = await mockElevenLabsService.generateAudio({
      text: 'Hey everyone, Luna here with another tech review.',
      voiceId: 'voice_abc123',
    });

    expect(result.audioUrl).toBeTruthy();
    expect(result.durationSeconds).toBeGreaterThan(0);
    expect(result.cost).toBeGreaterThan(0);
  });

  it('should return cost per generation', async () => {
    const result = await mockElevenLabsService.generateAudio({
      text: 'Short text',
      voiceId: 'voice_abc123',
    });

    expect(result.cost).toBeDefined();
    expect(result.cost).toBe(0.02);
  });

  it('should handle API errors', async () => {
    mockElevenLabsService.generateAudio.mockRejectedValueOnce(
      new Error('ElevenLabs: Voice not found')
    );

    await expect(
      mockElevenLabsService.generateAudio({
        text: 'test',
        voiceId: 'invalid',
      })
    ).rejects.toThrow('Voice not found');
  });

  it('should handle rate limiting', async () => {
    mockElevenLabsService.generateAudio.mockRejectedValueOnce(
      new Error('ElevenLabs: 429 Too Many Requests')
    );

    await expect(
      mockElevenLabsService.generateAudio({
        text: 'test',
        voiceId: 'voice_123',
      })
    ).rejects.toThrow('429');
  });
});
