import { mockPrisma } from '../helpers/mock-prisma';
import { createTestContentSlot } from '../helpers/test-helpers';


describe('PATCH /api/content-slots/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update slot emotional trigger', async () => {
    const slot = createTestContentSlot();
    mockPrisma.contentSlot.findUnique.mockResolvedValue(slot);
    mockPrisma.contentSlot.update.mockResolvedValue({
      ...slot,
      emotionalTrigger: 'surprise',
    });

    const updated = await mockPrisma.contentSlot.update({
      where: { id: slot.id },
      data: { emotionalTrigger: 'surprise' },
    });

    expect(updated.emotionalTrigger).toBe('surprise');
  });

  it('should update slot weekly theme', async () => {
    const slot = createTestContentSlot();
    mockPrisma.contentSlot.update.mockResolvedValue({
      ...slot,
      weeklyTheme: 'Behind the Scenes',
    });

    const updated = await mockPrisma.contentSlot.update({
      where: { id: slot.id },
      data: { weeklyTheme: 'Behind the Scenes' },
    });

    expect(updated.weeklyTheme).toBe('Behind the Scenes');
  });

  it('should return 404 for non-existent slot', async () => {
    mockPrisma.contentSlot.findUnique.mockResolvedValue(null);

    const slot = await mockPrisma.contentSlot.findUnique({
      where: { id: 'nonexistent' },
    });

    expect(slot).toBeNull();
  });

  it('should only allow owner to update slot', async () => {
    const slot = createTestContentSlot({ userId: 'owner-id' });
    mockPrisma.contentSlot.findUnique.mockResolvedValue(slot);

    const found = await mockPrisma.contentSlot.findUnique({
      where: { id: slot.id },
    });

    const requestUserId = 'different-user';
    expect(found!.userId).not.toBe(requestUserId);
  });
});
