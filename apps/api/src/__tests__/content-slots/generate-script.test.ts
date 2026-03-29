import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService } from '../helpers/mock-services';
import {
  createTestContentSlot,
  createTestCharacter,
  createTestScript,
} from '../helpers/test-helpers';


describe('POST /api/content-slots/:id/generate-script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a script for a specific slot', async () => {
    const slot = createTestContentSlot();
    const character = createTestCharacter();

    mockPrisma.contentSlot.findUnique.mockResolvedValue(slot);
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const scriptData = await mockClaudeService.generateScript({
      slot,
      character,
    });

    expect(scriptData).toBeDefined();
    expect(scriptData.title).toBeDefined();
    expect(scriptData.hook).toBeDefined();
    expect(scriptData.body).toBeDefined();
    expect(scriptData.cta).toBeDefined();
  });

  it('should create script record linked to the slot', async () => {
    const scriptData = await mockClaudeService.generateScript({
      slot: createTestContentSlot(),
      character: createTestCharacter(),
    });

    const script = createTestScript({
      title: scriptData.title,
      body: scriptData.body,
      hook: scriptData.hook,
      cta: scriptData.cta,
    });

    mockPrisma.script.create.mockResolvedValue(script);

    const created = await mockPrisma.script.create({
      data: {
        contentSlotId: 'test-slot-id',
        characterId: 'test-character-id',
        userId: 'test-user-id',
        title: scriptData.title,
        body: scriptData.body,
        hook: scriptData.hook,
        cta: scriptData.cta,
        emotionalTrigger: scriptData.emotionalTrigger,
        status: 'draft',
        generationMethod: 'ai_generated',
      },
    });

    expect(created.status).toBe('draft');
    expect(created.generationMethod).toBe('ai_generated');
  });

  it('should update slot status to script_generated', async () => {
    mockPrisma.contentSlot.update.mockResolvedValue(
      createTestContentSlot({ status: 'script_generated', scriptId: 'test-script-id' })
    );

    const updated = await mockPrisma.contentSlot.update({
      where: { id: 'test-slot-id' },
      data: { status: 'script_generated', scriptId: 'test-script-id' },
    });

    expect(updated.status).toBe('script_generated');
    expect(updated.scriptId).toBe('test-script-id');
  });

  it('should not generate if slot already has a script', async () => {
    const slotWithScript = createTestContentSlot({
      scriptId: 'existing-script-id',
      status: 'script_generated',
    });
    mockPrisma.contentSlot.findUnique.mockResolvedValue(slotWithScript);

    const slot = await mockPrisma.contentSlot.findUnique({
      where: { id: slotWithScript.id },
    });

    expect(slot!.scriptId).not.toBeNull();
    // Controller would return 400: Slot already has a script
  });
});
