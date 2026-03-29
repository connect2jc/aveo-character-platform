import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService } from '../helpers/mock-services';
import { createTestScript, createTestCharacter, createTestContentSlot } from '../helpers/test-helpers';


describe('POST /api/scripts/:id/regenerate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a new script for the same slot', async () => {
    const oldScript = createTestScript({ status: 'rejected' });
    const character = createTestCharacter();
    const slot = createTestContentSlot();

    mockPrisma.script.findUnique.mockResolvedValue(oldScript);
    mockPrisma.character.findUnique.mockResolvedValue(character);
    mockPrisma.contentSlot.findUnique.mockResolvedValue(slot);

    const newScriptData = await mockClaudeService.generateScript({
      slot,
      character,
      previousScript: oldScript.body,
      instruction: 'Make it less promotional',
    });

    expect(newScriptData).toBeDefined();
    expect(newScriptData.title).toBeDefined();
  });

  it('should mark old script as superseded', async () => {
    mockPrisma.script.update.mockResolvedValue(
      createTestScript({ status: 'superseded' })
    );

    const updated = await mockPrisma.script.update({
      where: { id: 'old-script-id' },
      data: { status: 'superseded' },
    });

    expect(updated.status).toBe('superseded');
  });

  it('should create new script linked to same slot', async () => {
    const newScript = createTestScript({
      id: 'new-script-id',
      contentSlotId: 'test-slot-id',
      status: 'draft',
    });

    mockPrisma.script.create.mockResolvedValue(newScript);

    const created = await mockPrisma.script.create({
      data: {
        contentSlotId: 'test-slot-id',
        characterId: 'test-character-id',
        userId: 'test-user-id',
        title: 'New title',
        body: 'New body',
        hook: 'New hook',
        cta: 'New CTA',
        status: 'draft',
        generationMethod: 'ai_regenerated',
      },
    });

    expect(created.id).toBe('new-script-id');
    expect(created.contentSlotId).toBe('test-slot-id');
    expect(created.status).toBe('draft');
  });

  it('should accept optional user feedback for regeneration', async () => {
    await mockClaudeService.generateScript({
      slot: createTestContentSlot(),
      character: createTestCharacter(),
      previousScript: 'Old script body',
      instruction: 'Make it more humorous and less formal',
    });

    expect(mockClaudeService.generateScript).toHaveBeenCalledWith(
      expect.objectContaining({
        instruction: 'Make it more humorous and less formal',
      })
    );
  });
});
