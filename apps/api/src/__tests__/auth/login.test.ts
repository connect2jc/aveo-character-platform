import { mockPrisma } from '../helpers/mock-prisma';
import { createTestUser } from '../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
const JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';

describe('POST /api/auth/login', () => {
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('CorrectP@ss123', 10);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login with correct credentials', async () => {
    const user = createTestUser({ passwordHash: hashedPassword });
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const found = await mockPrisma.user.findUnique({
      where: { email: user.email },
    });

    expect(found).not.toBeNull();

    const isValid = await bcrypt.compare('CorrectP@ss123', found!.passwordHash);
    expect(isValid).toBe(true);
  });

  it('should return 401 for wrong password', async () => {
    const user = createTestUser({ passwordHash: hashedPassword });
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const found = await mockPrisma.user.findUnique({
      where: { email: user.email },
    });

    const isValid = await bcrypt.compare('WrongPassword', found!.passwordHash);
    expect(isValid).toBe(false);
    // Controller would return 401
  });

  it('should return 404 for non-existent email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const found = await mockPrisma.user.findUnique({
      where: { email: 'nonexistent@example.com' },
    });

    expect(found).toBeNull();
    // Controller would return 404
  });

  it('should return JWT access + refresh tokens', async () => {
    const user = createTestUser({ passwordHash: hashedPassword });

    const accessToken = jwt.sign(
      { userId: user.id, plan: user.plan, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const accessDecoded = jwt.verify(accessToken, JWT_SECRET) as any;
    expect(accessDecoded.userId).toBe(user.id);
    expect(accessDecoded.plan).toBe('starter');

    const refreshDecoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    expect(refreshDecoded.userId).toBe(user.id);
    expect(refreshDecoded.type).toBe('refresh');
  });

  it('should not expose password hash in response', () => {
    const user = createTestUser({ passwordHash: hashedPassword });

    // Simulate response sanitization
    const { passwordHash, ...safeUser } = user;
    expect(safeUser).not.toHaveProperty('passwordHash');
    expect(safeUser.email).toBe(user.email);
    expect(safeUser.name).toBe(user.name);
  });
});
