jest.mock('../../config/database', () => ({
  prisma: require('../helpers/mock-prisma').mockPrisma,
}));

jest.mock('../../utils/encryption', () => ({
  encrypt: jest.fn().mockReturnValue({ encrypted: 'enc-data', iv: 'enc-iv' }),
  decrypt: jest.fn().mockReturnValue('decrypted-api-key'),
}));

jest.mock('axios');
jest.mock('openai');
jest.mock('@anthropic-ai/sdk');

import { SettingsService } from '../../services/settings.service';
import { mockPrisma } from '../helpers/mock-prisma';
import { encrypt, decrypt } from '../../utils/encryption';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const service = new SettingsService();
const userId = 'test-user-id';

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiKeys', () => {
    it('should return status for all valid providers', async () => {
      mockPrisma.userApiKey.findMany.mockResolvedValue([
        { provider: 'openai', isValid: true, updatedAt: new Date() },
      ]);

      const result = await service.getApiKeys(userId);
      expect(result).toHaveLength(5);
      expect(result.find((r: any) => r.provider === 'openai')).toEqual(
        expect.objectContaining({ hasKey: true, isValid: true })
      );
      expect(result.find((r: any) => r.provider === 'anthropic')).toEqual(
        expect.objectContaining({ hasKey: false, isValid: false })
      );
    });

    it('should return all false when no keys exist', async () => {
      mockPrisma.userApiKey.findMany.mockResolvedValue([]);
      const result = await service.getApiKeys(userId);
      result.forEach((r: any) => {
        expect(r.hasKey).toBe(false);
        expect(r.isValid).toBe(false);
      });
    });
  });

  describe('setApiKey', () => {
    it('should encrypt and upsert the key', async () => {
      mockPrisma.userApiKey.upsert.mockResolvedValue({});

      const result = await service.setApiKey(userId, 'openai', 'sk-test-key');
      expect(encrypt).toHaveBeenCalledWith('sk-test-key');
      expect(mockPrisma.userApiKey.upsert).toHaveBeenCalledWith({
        where: { userId_provider: { userId, provider: 'openai' } },
        create: { userId, provider: 'openai', encryptedKey: 'enc-data', iv: 'enc-iv', isValid: true },
        update: { encryptedKey: 'enc-data', iv: 'enc-iv', isValid: true },
      });
      expect(result).toEqual({ provider: 'openai', hasKey: true, isValid: true });
    });

    it('should throw BadRequestError for invalid provider', async () => {
      await expect(service.setApiKey(userId, 'invalid' as any, 'key')).rejects.toThrow('Invalid provider');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete the key and return hasKey false', async () => {
      mockPrisma.userApiKey.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteApiKey(userId, 'openai');
      expect(mockPrisma.userApiKey.deleteMany).toHaveBeenCalledWith({
        where: { userId, provider: 'openai' },
      });
      expect(result).toEqual({ provider: 'openai', hasKey: false, isValid: false });
    });
  });

  describe('getDecryptedKey', () => {
    it('should return decrypted key when record exists', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({
        encryptedKey: 'enc-data',
        iv: 'enc-iv',
      });

      const result = await service.getDecryptedKey(userId, 'openai');
      expect(decrypt).toHaveBeenCalledWith('enc-data', 'enc-iv');
      expect(result).toBe('decrypted-api-key');
    });

    it('should return null when no record exists', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);
      const result = await service.getDecryptedKey(userId, 'openai');
      expect(result).toBeNull();
    });
  });

  describe('testApiKey', () => {
    it('should throw NotFoundError when no key exists', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue(null);
      await expect(service.testApiKey(userId, 'openai')).rejects.toThrow('No API key found');
    });

    it('should return valid true on successful OpenAI test', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const OpenAIMock = require('openai');
      OpenAIMock.default = jest.fn().mockImplementation(() => ({
        models: { list: jest.fn().mockResolvedValue({ data: [] }) },
      }));

      const result = await service.testApiKey(userId, 'openai');
      expect(result).toEqual({ valid: true });
      expect(mockPrisma.userApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isValid: true } })
      );
    });

    it('should return valid false and error message on failure', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const OpenAIMock = require('openai');
      OpenAIMock.default = jest.fn().mockImplementation(() => ({
        models: { list: jest.fn().mockRejectedValue(new Error('Invalid API key')) },
      }));

      const result = await service.testApiKey(userId, 'openai');
      expect(result).toEqual({ valid: false, error: 'Invalid API key' });
      expect(mockPrisma.userApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isValid: false } })
      );
    });

    it('should test Anthropic key correctly', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const AnthropicMock = require('@anthropic-ai/sdk');
      AnthropicMock.default = jest.fn().mockImplementation(() => ({
        messages: { create: jest.fn().mockResolvedValue({ content: [] }) },
      }));

      const result = await service.testApiKey(userId, 'anthropic');
      expect(result).toEqual({ valid: true });
    });

    it('should test ElevenLabs key via axios', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const axios = require('axios');
      axios.get.mockResolvedValue({ data: {} });

      const result = await service.testApiKey(userId, 'elevenlabs');
      expect(result).toEqual({ valid: true });
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/user',
        expect.objectContaining({ headers: { 'xi-api-key': 'decrypted-api-key' } })
      );
    });

    it('should test FAL key via axios', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const axios = require('axios');
      axios.get.mockResolvedValue({ data: {} });

      const result = await service.testApiKey(userId, 'fal');
      expect(result).toEqual({ valid: true });
      expect(axios.get).toHaveBeenCalledWith(
        'https://queue.fal.run/fal-ai/flux/dev',
        expect.objectContaining({ headers: { Authorization: 'Key decrypted-api-key' } })
      );
    });

    it('should test HeyGen key via axios', async () => {
      mockPrisma.userApiKey.findUnique.mockResolvedValue({ encryptedKey: 'enc', iv: 'iv' });
      mockPrisma.userApiKey.update.mockResolvedValue({});

      const axios = require('axios');
      axios.get.mockResolvedValue({ data: {} });

      const result = await service.testApiKey(userId, 'heygen');
      expect(result).toEqual({ valid: true });
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.heygen.com/v2/user/remaining_quota',
        expect.objectContaining({ headers: { 'X-Api-Key': 'decrypted-api-key' } })
      );
    });
  });

  describe('getPreferences', () => {
    it('should return user provider preferences', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        scriptProvider: 'openai',
        imageProvider: 'fal',
        voiceProvider: 'elevenlabs',
      });

      const result = await service.getPreferences(userId);
      expect(result).toEqual({
        scriptProvider: 'openai',
        imageProvider: 'fal',
        voiceProvider: 'elevenlabs',
      });
    });

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getPreferences(userId)).rejects.toThrow('User not found');
    });
  });

  describe('updatePreferences', () => {
    it('should update and return new preferences', async () => {
      const updated = { scriptProvider: 'openai', imageProvider: 'openai', voiceProvider: 'openai' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updatePreferences(userId, { scriptProvider: 'openai' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { scriptProvider: 'openai' },
        select: { scriptProvider: true, imageProvider: true, voiceProvider: true },
      });
      expect(result).toEqual(updated);
    });
  });
});
