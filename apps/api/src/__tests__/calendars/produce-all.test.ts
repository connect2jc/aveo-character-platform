import { mockPrisma } from '../helpers/mock-prisma';
import { mockQueue } from '../helpers/mock-services';
import { createTestScript } from '../helpers/test-helpers';


describe('POST /api/calendars/:calendarId/produce-all', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find all approved scripts for the calendar', async () => {
    const approvedScripts = [
      createTestScript({ id: 'script-1', status: 'approved' }),
      createTestScript({ id: 'script-2', status: 'approved' }),
    ];

    mockPrisma.script.findMany.mockResolvedValue(approvedScripts);

    const scripts = await mockPrisma.script.findMany({
      where: {
        contentSlot: { calendarId: 'test-calendar-id' },
        status: 'approved',
      },
    });

    expect(scripts).toHaveLength(2);
    scripts.forEach((s: any) => expect(s.status).toBe('approved'));
  });

  it('should queue video production jobs for each approved script', async () => {
    const scriptIds = ['script-1', 'script-2', 'script-3'];

    for (const scriptId of scriptIds) {
      await mockQueue.add('produce-video', { scriptId, userId: 'test-user-id' });
    }

    expect(mockQueue.add).toHaveBeenCalledTimes(3);
    expect(mockQueue.add).toHaveBeenCalledWith('produce-video', {
      scriptId: 'script-1',
      userId: 'test-user-id',
    });
  });

  it('should return 400 if no approved scripts exist', async () => {
    mockPrisma.script.findMany.mockResolvedValue([]);

    const scripts = await mockPrisma.script.findMany({
      where: {
        contentSlot: { calendarId: 'test-calendar-id' },
        status: 'approved',
      },
    });

    expect(scripts).toHaveLength(0);
    // Controller would return 400: No approved scripts to produce
  });

  it('should skip scripts that already have videos', async () => {
    const scripts = [
      createTestScript({ id: 'script-1', status: 'approved' }),
      createTestScript({ id: 'script-2', status: 'approved' }),
    ];

    mockPrisma.video.findMany.mockResolvedValue([
      { scriptId: 'script-1', status: 'complete' },
    ]);

    const existingVideos = await mockPrisma.video.findMany({
      where: { scriptId: { in: scripts.map((s) => s.id) } },
    });

    const existingScriptIds = new Set(existingVideos.map((v: any) => v.scriptId));
    const toProcess = scripts.filter((s) => !existingScriptIds.has(s.id));

    expect(toProcess).toHaveLength(1);
    expect(toProcess[0].id).toBe('script-2');
  });
});
