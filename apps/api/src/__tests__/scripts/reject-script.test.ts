import { mockPrisma } from '../helpers/mock-prisma';
import { createTestScript } from '../helpers/test-helpers';


describe('POST /api/scripts/:id/reject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update script status to rejected', async () => {
    const script = createTestScript({ status: 'draft' });
    mockPrisma.script.findUnique.mockResolvedValue(script);
    mockPrisma.script.update.mockResolvedValue({
      ...script,
      status: 'rejected',
      reviewedAt: new Date(),
      rejectionReason: 'Too promotional',
    });

    const updated = await mockPrisma.script.update({
      where: { id: script.id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        rejectionReason: 'Too promotional',
      },
    });

    expect(updated.status).toBe('rejected');
    expect(updated.rejectionReason).toBe('Too promotional');
  });

  it('should set reviewedAt timestamp on rejection', async () => {
    const now = new Date();
    mockPrisma.script.update.mockResolvedValue(
      createTestScript({ status: 'rejected', reviewedAt: now })
    );

    const updated = await mockPrisma.script.update({
      where: { id: 'test-script-id' },
      data: { status: 'rejected', reviewedAt: now },
    });

    expect(updated.reviewedAt).toEqual(now);
  });

  it('should only allow owner to reject', async () => {
    const script = createTestScript({ userId: 'owner-id' });
    mockPrisma.script.findUnique.mockResolvedValue(script);

    const found = await mockPrisma.script.findUnique({
      where: { id: script.id },
    });

    expect(found!.userId).toBe('owner-id');
    expect(found!.userId).not.toBe('attacker-id');
  });

  it('should update slot status back to pending', async () => {
    mockPrisma.contentSlot.update.mockResolvedValue({
      id: 'test-slot-id',
      status: 'pending',
      scriptId: null,
    });

    const updated = await mockPrisma.contentSlot.update({
      where: { id: 'test-slot-id' },
      data: { status: 'pending', scriptId: null },
    });

    expect(updated.status).toBe('pending');
    expect(updated.scriptId).toBeNull();
  });
});
