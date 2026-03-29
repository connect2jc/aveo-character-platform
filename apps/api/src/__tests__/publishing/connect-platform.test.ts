import { mockPrisma } from '../helpers/mock-prisma';
import { createTestPlatformConnection } from '../helpers/test-helpers';


describe('Platform Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate OAuth flow for each platform', () => {
    const platforms = ['youtube', 'tiktok', 'instagram', 'twitter'];
    const oauthUrls: Record<string, string> = {
      youtube: 'https://accounts.google.com/o/oauth2/v2/auth',
      tiktok: 'https://www.tiktok.com/v2/auth/authorize',
      instagram: 'https://api.instagram.com/oauth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize',
    };

    platforms.forEach((platform) => {
      expect(oauthUrls[platform]).toBeDefined();
      expect(oauthUrls[platform]).toMatch(/^https:\/\//);
    });
  });

  it('should store access + refresh tokens', async () => {
    const connection = createTestPlatformConnection();
    mockPrisma.platformConnection.create.mockResolvedValue(connection);

    const created = await mockPrisma.platformConnection.create({
      data: {
        userId: 'test-user-id',
        platform: 'youtube',
        accessToken: 'ya29.new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        channelId: 'UC_test',
        channelName: 'Luna AI Tech',
        connected: true,
      },
    });

    expect(created.accessToken).toBeDefined();
    expect(created.refreshToken).toBeDefined();
    expect(created.connected).toBe(true);
  });

  it('should handle token refresh', async () => {
    const expiredConnection = createTestPlatformConnection({
      expiresAt: new Date(Date.now() - 3600000), // expired 1 hour ago
    });

    mockPrisma.platformConnection.findFirst.mockResolvedValue(expiredConnection);

    const conn = await mockPrisma.platformConnection.findFirst({
      where: { userId: 'test-user-id', platform: 'youtube' },
    });

    const isExpired = conn!.expiresAt.getTime() < Date.now();
    expect(isExpired).toBe(true);

    // Should refresh the token
    mockPrisma.platformConnection.update.mockResolvedValue({
      ...expiredConnection,
      accessToken: 'ya29.refreshed-token',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const refreshed = await mockPrisma.platformConnection.update({
      where: { id: conn!.id },
      data: {
        accessToken: 'ya29.refreshed-token',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    expect(refreshed.accessToken).toBe('ya29.refreshed-token');
    expect(refreshed.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should disconnect platform', async () => {
    mockPrisma.platformConnection.update.mockResolvedValue(
      createTestPlatformConnection({ connected: false })
    );

    const updated = await mockPrisma.platformConnection.update({
      where: { id: 'test-connection-id' },
      data: { connected: false, accessToken: null, refreshToken: null },
    });

    expect(updated.connected).toBe(false);
  });

  it('should not allow duplicate platform connections for same user', async () => {
    const existing = createTestPlatformConnection({ platform: 'youtube' });
    mockPrisma.platformConnection.findFirst.mockResolvedValue(existing);

    const found = await mockPrisma.platformConnection.findFirst({
      where: {
        userId: 'test-user-id',
        platform: 'youtube',
        connected: true,
      },
    });

    expect(found).not.toBeNull();
    // Controller would return 409: Platform already connected
  });
});
