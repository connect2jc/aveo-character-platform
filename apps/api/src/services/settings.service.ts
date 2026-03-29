import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { prisma } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { VALID_PROVIDERS, Provider } from '../validators/settings.validator';
import { logger } from '../utils/logger';

export class SettingsService {
  async getApiKeys(userId: string) {
    const keys = await prisma.userApiKey.findMany({
      where: { userId },
      select: { provider: true, isValid: true, updatedAt: true },
    });

    return VALID_PROVIDERS.map((provider) => {
      const key = keys.find((k) => k.provider === provider);
      return {
        provider,
        hasKey: !!key,
        isValid: key?.isValid ?? false,
        updatedAt: key?.updatedAt ?? null,
      };
    });
  }

  async setApiKey(userId: string, provider: Provider, apiKey: string) {
    if (!VALID_PROVIDERS.includes(provider)) {
      throw new BadRequestError(`Invalid provider: ${provider}`);
    }

    const { encrypted, iv } = encrypt(apiKey);

    await prisma.userApiKey.upsert({
      where: { userId_provider: { userId, provider } },
      create: { userId, provider, encryptedKey: encrypted, iv, isValid: true },
      update: { encryptedKey: encrypted, iv, isValid: true },
    });

    return { provider, hasKey: true, isValid: true };
  }

  async deleteApiKey(userId: string, provider: Provider) {
    await prisma.userApiKey.deleteMany({
      where: { userId, provider },
    });
    return { provider, hasKey: false, isValid: false };
  }

  async getDecryptedKey(userId: string, provider: Provider): Promise<string | null> {
    const record = await prisma.userApiKey.findUnique({
      where: { userId_provider: { userId, provider } },
    });

    if (!record) return null;
    return decrypt(record.encryptedKey, record.iv);
  }

  async testApiKey(userId: string, provider: Provider): Promise<{ valid: boolean; error?: string }> {
    const apiKey = await this.getDecryptedKey(userId, provider);
    if (!apiKey) {
      throw new NotFoundError(`No API key found for ${provider}`);
    }

    try {
      switch (provider) {
        case 'openai': {
          const openai = new OpenAI({ apiKey });
          await openai.models.list();
          break;
        }
        case 'anthropic': {
          const anthropic = new Anthropic({ apiKey });
          await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Hi' }],
          });
          break;
        }
        case 'fal': {
          await axios.get('https://queue.fal.run/fal-ai/flux/dev', {
            headers: { Authorization: `Key ${apiKey}` },
            timeout: 10000,
          });
          break;
        }
        case 'elevenlabs': {
          await axios.get('https://api.elevenlabs.io/v1/user', {
            headers: { 'xi-api-key': apiKey },
            timeout: 10000,
          });
          break;
        }
        case 'heygen': {
          await axios.get('https://api.heygen.com/v2/user/remaining_quota', {
            headers: { 'X-Api-Key': apiKey },
            timeout: 10000,
          });
          break;
        }
      }

      await prisma.userApiKey.update({
        where: { userId_provider: { userId, provider } },
        data: { isValid: true },
      });

      return { valid: true };
    } catch (error: any) {
      logger.warn(`API key test failed for ${provider}`, { error: error.message });

      await prisma.userApiKey.update({
        where: { userId_provider: { userId, provider } },
        data: { isValid: false },
      });

      return { valid: false, error: error.message };
    }
  }

  async getPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { scriptProvider: true, imageProvider: true, voiceProvider: true },
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updatePreferences(userId: string, data: {
    scriptProvider?: string;
    imageProvider?: string;
    voiceProvider?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { scriptProvider: true, imageProvider: true, voiceProvider: true },
    });

    return user;
  }
}

export const settingsService = new SettingsService();
