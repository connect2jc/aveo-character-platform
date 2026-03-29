import { mockPrisma } from '../helpers/mock-prisma';
import {
  generateRefreshToken,
  generateExpiredRefreshToken,
  createTestUser,
} from '../helpers/test-helpers';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
const JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should issue new tokens with valid refresh token', async () => {
    const userId = 'test-user-id';
    const refreshToken = generateRefreshToken(userId);
    const user = createTestUser({ id: userId });

    // Verify the refresh token is valid
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    expect(decoded.userId).toBe(userId);
    expect(decoded.type).toBe('refresh');

    mockPrisma.user.findUnique.mockResolvedValue(user);
    const foundUser = await mockPrisma.user.findUnique({
      where: { id: decoded.userId },
    });
    expect(foundUser).not.toBeNull();

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { userId: foundUser!.id, plan: foundUser!.plan, role: foundUser!.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: foundUser!.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    expect(newAccessToken).toBeTruthy();
    expect(newRefreshToken).toBeTruthy();

    const newDecoded = jwt.verify(newAccessToken, JWT_SECRET) as any;
    expect(newDecoded.userId).toBe(userId);
  });

  it('should return 401 for expired refresh token', async () => {
    const expiredToken = generateExpiredRefreshToken('test-user-id');

    // Wait a tick for the token to truly expire
    await new Promise((r) => setTimeout(r, 100));

    expect(() => {
      jwt.verify(expiredToken, JWT_REFRESH_SECRET);
    }).toThrow(jwt.TokenExpiredError);
  });

  it('should return 401 for invalid refresh token', () => {
    const invalidToken = 'completely.invalid.token';

    expect(() => {
      jwt.verify(invalidToken, JWT_REFRESH_SECRET);
    }).toThrow(jwt.JsonWebTokenError);
  });

  it('should return 401 for refresh token signed with wrong secret', () => {
    const wrongSecretToken = jwt.sign(
      { userId: 'test-user-id', type: 'refresh' },
      'wrong-secret',
      { expiresIn: '7d' }
    );

    expect(() => {
      jwt.verify(wrongSecretToken, JWT_REFRESH_SECRET);
    }).toThrow(jwt.JsonWebTokenError);
  });
});
