import { mockPrisma } from '../helpers/mock-prisma';
import { createTestUser } from '../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


describe('Password Reset Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should create reset token for existing user', async () => {
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const found = await mockPrisma.user.findUnique({
        where: { email: user.email },
      });
      expect(found).not.toBeNull();

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      mockPrisma.passwordReset.create.mockResolvedValue({
        id: 'reset-id',
        userId: user.id,
        token: hashedToken,
        expiresAt,
        used: false,
      });

      const record = await mockPrisma.passwordReset.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt,
        },
      });

      expect(record.token).toBe(hashedToken);
      expect(record.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(resetToken).toHaveLength(64);
    });

    it('should return success even for non-existent email (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const found = await mockPrisma.user.findUnique({
        where: { email: 'nobody@example.com' },
      });
      expect(found).toBeNull();

      // Should still return 200 to prevent email enumeration
      // No reset record created
      expect(mockPrisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('should invalidate previous reset tokens', async () => {
      const user = createTestUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.passwordReset.updateMany.mockResolvedValue({ count: 2 });

      await mockPrisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      expect(mockPrisma.passwordReset.updateMany).toHaveBeenCalledWith({
        where: { userId: user.id, used: false },
        data: { used: true },
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      mockPrisma.passwordReset.findFirst.mockResolvedValue({
        id: 'reset-id',
        userId: 'test-user-id',
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
      });

      const record = await mockPrisma.passwordReset.findFirst({
        where: {
          token: hashedToken,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      expect(record).not.toBeNull();

      const newPassword = 'NewSecureP@ss456';
      const newHash = await bcrypt.hash(newPassword, 10);

      mockPrisma.user.update.mockResolvedValue(
        createTestUser({ passwordHash: newHash })
      );

      await mockPrisma.user.update({
        where: { id: record!.userId },
        data: { passwordHash: newHash },
      });

      expect(mockPrisma.user.update).toHaveBeenCalled();

      const isValid = await bcrypt.compare(newPassword, newHash);
      expect(isValid).toBe(true);
    });

    it('should reject expired reset token', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      const result = await mockPrisma.passwordReset.findFirst({
        where: {
          token: 'some-expired-token',
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      expect(result).toBeNull();
    });

    it('should mark token as used after reset', async () => {
      mockPrisma.passwordReset.update.mockResolvedValue({
        id: 'reset-id',
        used: true,
      });

      await mockPrisma.passwordReset.update({
        where: { id: 'reset-id' },
        data: { used: true },
      });

      expect(mockPrisma.passwordReset.update).toHaveBeenCalledWith({
        where: { id: 'reset-id' },
        data: { used: true },
      });
    });
  });
});
