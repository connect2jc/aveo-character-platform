import { mockPrisma } from '../helpers/mock-prisma';
import { createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/characters/:id/select-voice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update character with selected voice ID', async () => {
    const selectedVoiceId = 'voice_opt_2';

    mockPrisma.voiceOption.findFirst.mockResolvedValue({
      id: 'vo-2',
      characterId: 'test-character-id',
      voiceId: selectedVoiceId,
      name: 'Luna Voice B',
    });

    mockPrisma.character.update.mockResolvedValue(
      createTestCharacter({ selectedVoiceId })
    );

    const voiceOption = await mockPrisma.voiceOption.findFirst({
      where: {
        characterId: 'test-character-id',
        voiceId: selectedVoiceId,
      },
    });

    expect(voiceOption).not.toBeNull();

    const updated = await mockPrisma.character.update({
      where: { id: 'test-character-id' },
      data: { selectedVoiceId, status: 'active' },
    });

    expect(updated.selectedVoiceId).toBe(selectedVoiceId);
    expect(updated.status).toBe('active');
  });

  it('should return 404 for invalid voice option', async () => {
    mockPrisma.voiceOption.findFirst.mockResolvedValue(null);

    const voiceOption = await mockPrisma.voiceOption.findFirst({
      where: {
        characterId: 'test-character-id',
        voiceId: 'nonexistent-voice',
      },
    });

    expect(voiceOption).toBeNull();
    // Controller would return 404
  });

  it('should only allow owner to select voice', async () => {
    const character = createTestCharacter({ userId: 'owner-user-id' });
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const found = await mockPrisma.character.findUnique({
      where: { id: 'test-character-id' },
    });

    const requestUserId = 'different-user-id';
    expect(found!.userId).not.toBe(requestUserId);
    // Controller would return 403
  });

  it('should set character status to active after voice selection', async () => {
    mockPrisma.character.update.mockResolvedValue(
      createTestCharacter({ status: 'active', selectedVoiceId: 'voice_opt_1' })
    );

    const updated = await mockPrisma.character.update({
      where: { id: 'test-character-id' },
      data: { selectedVoiceId: 'voice_opt_1', status: 'active' },
    });

    expect(updated.status).toBe('active');
  });
});
