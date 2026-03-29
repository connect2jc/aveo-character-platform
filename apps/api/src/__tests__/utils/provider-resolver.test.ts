jest.mock('../../config/database', () => ({
  prisma: require('../helpers/mock-prisma').mockPrisma,
}));

jest.mock('../../utils/encryption', () => ({
  decrypt: jest.fn().mockReturnValue('user-decrypted-key'),
}));

jest.mock('../../config/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'env-anthropic-key',
    OPENAI_API_KEY: 'env-openai-key',
    FAL_API_KEY: 'env-fal-key',
    ELEVENLABS_API_KEY: 'env-elevenlabs-key',
    HEYGEN_API_KEY: 'env-heygen-key',
    ENCRYPTION_KEY: 'a'.repeat(64),
  },
}));

import {
  resolveScriptProvider,
  resolveImageProvider,
  resolveVoiceProvider,
  resolveHeygenKey,
} from '../../utils/provider-resolver';
import { mockPrisma } from '../helpers/mock-prisma';
import { BadRequestError } from '../../utils/errors';

const userId = 'test-user-id';

describe('Provider Resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveScriptProvider', () => {
    it('should use user key when available (anthropic)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'anthropic' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

      const result = await resolveScriptProvider(userId);
      expect(result).toEqual({ provider: 'anthropic', apiKey: 'user-decrypted-key' });
    });

    it('should use user key when available (openai)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'openai' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

      const result = await resolveScriptProvider(userId);
      expect(result).toEqual({ provider: 'openai', apiKey: 'user-decrypted-key' });
    });

    it('should fall back to env var for anthropic', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'anthropic' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveScriptProvider(userId);
      expect(result).toEqual({ provider: 'anthropic', apiKey: 'env-anthropic-key' });
    });

    it('should fall back to env var for openai', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'openai' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveScriptProvider(userId);
      expect(result).toEqual({ provider: 'openai', apiKey: 'env-openai-key' });
    });

    it('should default to anthropic when no user preference', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveScriptProvider(userId);
      expect(result).toEqual({ provider: 'anthropic', apiKey: 'env-anthropic-key' });
    });

    it('should throw when no key available', async () => {
      jest.resetModules();
      jest.doMock('../../config/env', () => ({
        env: { ENCRYPTION_KEY: 'a'.repeat(64) },
      }));
      jest.doMock('../../config/database', () => ({
        prisma: require('../helpers/mock-prisma').mockPrisma,
      }));
      jest.doMock('../../utils/encryption', () => ({
        decrypt: jest.fn(),
      }));

      const { resolveScriptProvider: resolve } = require('../../utils/provider-resolver');
      mockPrisma.user.findUnique.mockResolvedValue({ scriptProvider: 'openai' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      await expect(resolve(userId)).rejects.toThrow('No API key available');
    });
  });

  describe('resolveImageProvider', () => {
    it('should use user key for fal', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ imageProvider: 'fal' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

      const result = await resolveImageProvider(userId);
      expect(result).toEqual({ provider: 'fal', apiKey: 'user-decrypted-key' });
    });

    it('should fall back to env var for fal', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ imageProvider: 'fal' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveImageProvider(userId);
      expect(result).toEqual({ provider: 'fal', apiKey: 'env-fal-key' });
    });

    it('should use openai when preferred', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ imageProvider: 'openai' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveImageProvider(userId);
      expect(result).toEqual({ provider: 'openai', apiKey: 'env-openai-key' });
    });

    it('should default to fal when no preference', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveImageProvider(userId);
      expect(result).toEqual({ provider: 'fal', apiKey: 'env-fal-key' });
    });
  });

  describe('resolveVoiceProvider', () => {
    it('should use user key for elevenlabs', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ voiceProvider: 'elevenlabs' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

      const result = await resolveVoiceProvider(userId);
      expect(result).toEqual({ provider: 'elevenlabs', apiKey: 'user-decrypted-key' });
    });

    it('should fall back to env var for elevenlabs', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ voiceProvider: 'elevenlabs' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveVoiceProvider(userId);
      expect(result).toEqual({ provider: 'elevenlabs', apiKey: 'env-elevenlabs-key' });
    });

    it('should use openai when preferred', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ voiceProvider: 'openai' });
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveVoiceProvider(userId);
      expect(result).toEqual({ provider: 'openai', apiKey: 'env-openai-key' });
    });

    it('should default to elevenlabs', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveVoiceProvider(userId);
      expect(result).toEqual({ provider: 'elevenlabs', apiKey: 'env-elevenlabs-key' });
    });
  });

  describe('resolveHeygenKey', () => {
    it('should use user key when available', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });

      const result = await resolveHeygenKey(userId);
      expect(result).toBe('user-decrypted-key');
    });

    it('should fall back to env var', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);

      const result = await resolveHeygenKey(userId);
      expect(result).toBe('env-heygen-key');
    });
  });
});
