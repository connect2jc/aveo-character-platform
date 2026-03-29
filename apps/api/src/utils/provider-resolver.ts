import { prisma } from '../config/database';
import { decrypt } from './encryption';
import { env } from '../config/env';
import { BadRequestError } from './errors';

interface ResolvedProvider {
  provider: string;
  apiKey: string;
}

async function getUserKey(userId: string, provider: string): Promise<string | null> {
  const record = await prisma.userApiKey.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (!record) return null;
  return decrypt(record.encryptedKey, record.iv);
}

export async function resolveScriptProvider(userId: string): Promise<ResolvedProvider> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scriptProvider: true },
  });

  const provider = user?.scriptProvider || 'anthropic';

  // Try user's own key first
  const userKey = await getUserKey(userId, provider);
  if (userKey) return { provider, apiKey: userKey };

  // Fall back to env var
  if (provider === 'anthropic' && env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', apiKey: env.ANTHROPIC_API_KEY };
  }
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: env.OPENAI_API_KEY };
  }

  throw new BadRequestError(`No API key available for script provider: ${provider}. Please add your key in Settings.`);
}

export async function resolveImageProvider(userId: string): Promise<ResolvedProvider> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageProvider: true },
  });

  const provider = user?.imageProvider || 'fal';

  const userKey = await getUserKey(userId, provider);
  if (userKey) return { provider, apiKey: userKey };

  if (provider === 'fal' && env.FAL_API_KEY) {
    return { provider: 'fal', apiKey: env.FAL_API_KEY };
  }
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: env.OPENAI_API_KEY };
  }

  throw new BadRequestError(`No API key available for image provider: ${provider}. Please add your key in Settings.`);
}

export async function resolveVoiceProvider(userId: string): Promise<ResolvedProvider> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { voiceProvider: true },
  });

  const provider = user?.voiceProvider || 'elevenlabs';

  const userKey = await getUserKey(userId, provider);
  if (userKey) return { provider, apiKey: userKey };

  if (provider === 'elevenlabs' && env.ELEVENLABS_API_KEY) {
    return { provider: 'elevenlabs', apiKey: env.ELEVENLABS_API_KEY };
  }
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: env.OPENAI_API_KEY };
  }

  throw new BadRequestError(`No API key available for voice provider: ${provider}. Please add your key in Settings.`);
}

export async function resolveHeygenKey(userId: string): Promise<string> {
  const userKey = await getUserKey(userId, 'heygen');
  if (userKey) return userKey;

  if (env.HEYGEN_API_KEY) return env.HEYGEN_API_KEY;

  throw new BadRequestError('No HeyGen API key available. Please add your key in Settings.');
}
