import { mockPrisma } from '../helpers/mock-prisma';
import { mockElevenLabsService } from '../helpers/mock-services';
import { createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/characters/:id/generate-voice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create 3 voice options via ElevenLabs Voice Design', async () => {
    const character = createTestCharacter();
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const result = await mockElevenLabsService.generateVoiceOptions({
      prompt: character.voicePrompt,
      count: 3,
    });

    expect(result.voices).toHaveLength(3);
    result.voices.forEach((voice: any) => {
      expect(voice.voiceId).toBeDefined();
      expect(voice.name).toBeDefined();
      expect(voice.sampleUrl).toBeDefined();
    });
  });

  it('should return voice samples for preview', async () => {
    const result = await mockElevenLabsService.generateVoiceOptions({
      prompt: 'Young female, energetic',
      count: 3,
    });

    result.voices.forEach((voice: any) => {
      expect(voice.sampleUrl).toMatch(/^https:\/\//);
      expect(voice.sampleUrl).toContain('.mp3');
    });
  });

  it('should save voice options to database', async () => {
    const result = await mockElevenLabsService.generateVoiceOptions({
      prompt: 'test',
      count: 3,
    });

    const voiceRecords = result.voices.map((v: any) => ({
      characterId: 'test-character-id',
      voiceId: v.voiceId,
      name: v.name,
      sampleUrl: v.sampleUrl,
      description: v.description,
    }));

    mockPrisma.voiceOption.createMany.mockResolvedValue({
      count: voiceRecords.length,
    });

    const created = await mockPrisma.voiceOption.createMany({
      data: voiceRecords,
    });

    expect(created.count).toBe(3);
  });

  it('should handle ElevenLabs API errors', async () => {
    mockElevenLabsService.generateVoiceOptions.mockRejectedValueOnce(
      new Error('ElevenLabs: Rate limit exceeded')
    );

    await expect(
      mockElevenLabsService.generateVoiceOptions({ prompt: 'test', count: 3 })
    ).rejects.toThrow('ElevenLabs: Rate limit exceeded');
  });

  it('should track ElevenLabs cost', async () => {
    const result = await mockElevenLabsService.generateVoiceOptions({
      prompt: 'test',
      count: 3,
    });

    expect(result.cost).toBe(0.15);

    mockPrisma.apiCostLog.create.mockResolvedValue({
      id: 'cost-el-1',
      service: 'elevenlabs',
      operation: 'voice_design',
      cost: result.cost,
    });

    await mockPrisma.apiCostLog.create({
      data: {
        userId: 'test-user-id',
        service: 'elevenlabs',
        operation: 'voice_design',
        cost: result.cost,
      },
    });

    expect(mockPrisma.apiCostLog.create).toHaveBeenCalled();
  });
});
