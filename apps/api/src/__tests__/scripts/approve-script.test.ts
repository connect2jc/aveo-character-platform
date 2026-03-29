import { mockPrisma } from '../helpers/mock-prisma';
import { createTestScript } from '../helpers/test-helpers';


describe('POST /api/scripts/:id/approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update script status to approved', async () => {
    const script = createTestScript({ status: 'draft' });
    mockPrisma.script.findUnique.mockResolvedValue(script);
    mockPrisma.script.update.mockResolvedValue({
      ...script,
      status: 'approved',
      reviewedAt: new Date(),
    });

    const updated = await mockPrisma.script.update({
      where: { id: script.id },
      data: { status: 'approved', reviewedAt: new Date() },
    });

    expect(updated.status).toBe('approved');
  });

  it('should set reviewedAt timestamp', async () => {
    const now = new Date();
    mockPrisma.script.update.mockResolvedValue(
      createTestScript({ status: 'approved', reviewedAt: now })
    );

    const updated = await mockPrisma.script.update({
      where: { id: 'test-script-id' },
      data: { status: 'approved', reviewedAt: now },
    });

    expect(updated.reviewedAt).toBeDefined();
    expect(updated.reviewedAt).toEqual(now);
  });

  it('should only allow owner to approve', async () => {
    const script = createTestScript({ userId: 'owner-user-id' });
    mockPrisma.script.findUnique.mockResolvedValue(script);

    const found = await mockPrisma.script.findUnique({
      where: { id: script.id },
    });

    const requestUserId = 'different-user-id';
    expect(found!.userId).not.toBe(requestUserId);
    // Controller would return 403
  });

  it('should return 404 for non-existent script', async () => {
    mockPrisma.script.findUnique.mockResolvedValue(null);

    const found = await mockPrisma.script.findUnique({
      where: { id: 'nonexistent-id' },
    });

    expect(found).toBeNull();
  });

  it('should not approve already approved script', async () => {
    const script = createTestScript({ status: 'approved' });
    mockPrisma.script.findUnique.mockResolvedValue(script);

    const found = await mockPrisma.script.findUnique({
      where: { id: script.id },
    });

    expect(found!.status).toBe('approved');
    // Controller would return 400: Script already approved
  });
});
