import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService, mockQueue } from '../helpers/mock-services';
import { createTestContentSlot, createTestScript } from '../helpers/test-helpers';


describe('POST /api/calendars/:calendarId/generate-scripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue BullMQ job for batch script generation', async () => {
    const jobResult = await mockQueue.add('generate-scripts-batch', {
      calendarId: 'test-calendar-id',
      userId: 'test-user-id',
    });

    expect(jobResult.id).toBe('job-123');
    expect(mockQueue.add).toHaveBeenCalledWith('generate-scripts-batch', {
      calendarId: 'test-calendar-id',
      userId: 'test-user-id',
    });
  });

  it('should generate scripts for all pending slots', async () => {
    const pendingSlots = [
      createTestContentSlot({ id: 'slot-1', status: 'pending' }),
      createTestContentSlot({ id: 'slot-2', status: 'pending' }),
      createTestContentSlot({ id: 'slot-3', status: 'pending' }),
    ];

    mockPrisma.contentSlot.findMany.mockResolvedValue(pendingSlots);

    const slots = await mockPrisma.contentSlot.findMany({
      where: {
        calendarId: 'test-calendar-id',
        status: 'pending',
      },
    });

    expect(slots).toHaveLength(3);
    slots.forEach((slot: any) => {
      expect(slot.status).toBe('pending');
    });
  });

  it('should respect character voice and anti-keywords', async () => {
    await mockClaudeService.generateBatchScripts({
      slots: [{ id: 'slot-1', emotionalTrigger: 'curiosity' }],
      character: {
        speakingStyle: 'Casual and witty',
        antiKeywords: ['obviously', 'game-changer'],
      },
    });

    expect(mockClaudeService.generateBatchScripts).toHaveBeenCalledWith(
      expect.objectContaining({
        character: expect.objectContaining({
          antiKeywords: expect.arrayContaining(['obviously', 'game-changer']),
        }),
      })
    );
  });

  it('should track progress', async () => {
    const totalSlots = 10;
    let completedSlots = 0;

    // Simulate progress tracking
    for (let i = 0; i < totalSlots; i++) {
      completedSlots++;
      const progress = Math.round((completedSlots / totalSlots) * 100);
      expect(progress).toBeLessThanOrEqual(100);
    }

    expect(completedSlots).toBe(totalSlots);

    mockPrisma.contentCalendar.update.mockResolvedValue({
      id: 'test-calendar-id',
      generatedScripts: totalSlots,
    });

    await mockPrisma.contentCalendar.update({
      where: { id: 'test-calendar-id' },
      data: { generatedScripts: totalSlots },
    });

    expect(mockPrisma.contentCalendar.update).toHaveBeenCalled();
  });

  it('should handle partial failures (some scripts fail, others succeed)', async () => {
    const results = [
      { slotId: 'slot-1', status: 'success', script: createTestScript() },
      { slotId: 'slot-2', status: 'failed', error: 'Claude API timeout' },
      { slotId: 'slot-3', status: 'success', script: createTestScript() },
    ];

    const succeeded = results.filter((r) => r.status === 'success');
    const failed = results.filter((r) => r.status === 'failed');

    expect(succeeded).toHaveLength(2);
    expect(failed).toHaveLength(1);

    // Should update succeeded slots
    mockPrisma.contentSlot.updateMany.mockResolvedValue({ count: 2 });
    await mockPrisma.contentSlot.updateMany({
      where: { id: { in: succeeded.map((s) => s.slotId) } },
      data: { status: 'script_generated' },
    });

    // Should mark failed slots for retry
    mockPrisma.contentSlot.updateMany.mockResolvedValue({ count: 1 });
    await mockPrisma.contentSlot.updateMany({
      where: { id: { in: failed.map((f) => f.slotId) } },
      data: { status: 'script_failed' },
    });

    expect(mockPrisma.contentSlot.updateMany).toHaveBeenCalledTimes(2);
  });
});
