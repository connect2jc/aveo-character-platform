jest.mock('../../config/database', () => ({
  prisma: require('../helpers/mock-prisma').mockPrisma,
}));

jest.mock('../../utils/encryption', () => ({
  encrypt: jest.fn().mockReturnValue({ encrypted: 'enc-data', iv: 'enc-iv' }),
  decrypt: jest.fn().mockReturnValue('user-openai-key'),
}));

jest.mock('../../config/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'env-anthropic-key',
    OPENAI_API_KEY: '',
    FAL_API_KEY: 'env-fal-key',
    ELEVENLABS_API_KEY: 'env-elevenlabs-key',
    HEYGEN_API_KEY: 'env-heygen-key',
    ENCRYPTION_KEY: 'a'.repeat(64),
  },
}));

import { SettingsService } from '../../services/settings.service';
import { resolveScriptProvider, resolveImageProvider, resolveVoiceProvider } from '../../utils/provider-resolver';
import { mockPrisma } from '../helpers/mock-prisma';
import { encrypt } from '../../utils/encryption';

const settingsService = new SettingsService();
const userId = 'integration-user';

describe('BYOK + Provider Switching Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save an OpenAI key and then resolve it as the script provider', async () => {
    // Step 1: Save API key
    mockPrisma.userApiKey.upsert.mockResolvedValue({});
    await settingsService.setApiKey(userId, 'openai', 'sk-real-openai-key');
    expect(encrypt).toHaveBeenCalledWith('sk-real-openai-key');

    // Step 2: Set preference to openai
    mockPrisma.user.update.mockResolvedValue({
      scriptProvider: 'openai',
      imageProvider: 'fal',
      voiceProvider: 'elevenlabs',
    });
    await settingsService.updatePreferences(userId, { scriptProvider: 'openai' });

    // Step 3: Resolve provider - should use user's key
    mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'openai' });
    mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

    const resolved = await resolveScriptProvider(userId);
    expect(resolved.provider).toBe('openai');
    expect(resolved.apiKey).toBe('user-openai-key');
  });

  it('should fall back to env key when user has no BYOK key', async () => {
    // User prefers anthropic but has no key
    mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'anthropic' });
    mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

    const resolved = await resolveScriptProvider(userId);
    expect(resolved.provider).toBe('anthropic');
    expect(resolved.apiKey).toBe('env-anthropic-key');
  });

  it('should delete a key and then fail to resolve without env fallback', async () => {
    // Delete key
    mockPrisma.userApiKey.deleteMany.mockResolvedValue({ count: 1 });
    await settingsService.deleteApiKey(userId, 'openai');

    // User prefers openai, no user key, no env key (OPENAI_API_KEY is empty)
    mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'openai' });
    mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

    await expect(resolveScriptProvider(userId)).rejects.toThrow('No API key available');
  });

  it('should handle full provider switch from default to openai', async () => {
    // Initial state: defaults (anthropic/fal/elevenlabs)
    mockPrisma.user.findUnique.mockResolvedValueOnce({ imageProvider: 'fal' });
    mockPrisma.userApiKey.findUnique.mockResolvedValueOnce(null);
    const initialImage = await resolveImageProvider(userId);
    expect(initialImage.provider).toBe('fal');

    // User saves OpenAI key and switches image provider
    mockPrisma.userApiKey.upsert.mockResolvedValue({});
    await settingsService.setApiKey(userId, 'openai', 'sk-openai');

    mockPrisma.user.update.mockResolvedValue({ imageProvider: 'openai' });
    await settingsService.updatePreferences(userId, { imageProvider: 'openai' });

    // Now resolve should return openai with user key
    mockPrisma.user.findUnique.mockResolvedValueOnce({ imageProvider: 'openai' });
    mockPrisma.userApiKey.findUnique.mockResolvedValueOnce({ encryptedKey: 'enc', iv: 'iv' });
    const switched = await resolveImageProvider(userId);
    expect(switched.provider).toBe('openai');
    expect(switched.apiKey).toBe('user-openai-key');
  });

  it('should list API key statuses correctly after saving multiple keys', async () => {
    mockPrisma.userApiKey.findMany.mockResolvedValue([
      { provider: 'openai', isValid: true, updatedAt: new Date() },
      { provider: 'anthropic', isValid: false, updatedAt: new Date() },
    ]);

    const keys = await settingsService.getApiKeys(userId);
    const openai = keys.find((k: any) => k.provider === 'openai');
    const anthropic = keys.find((k: any) => k.provider === 'anthropic');
    const fal = keys.find((k: any) => k.provider === 'fal');

    expect(openai).toEqual(expect.objectContaining({ hasKey: true, isValid: true }));
    expect(anthropic).toEqual(expect.objectContaining({ hasKey: true, isValid: false }));
    expect(fal).toEqual(expect.objectContaining({ hasKey: false, isValid: false }));
  });
});
