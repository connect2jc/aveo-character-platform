import { z } from 'zod';

export const saveApiKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

export const updatePreferencesSchema = z.object({
  scriptProvider: z.enum(['anthropic', 'openai']).optional(),
  imageProvider: z.enum(['fal', 'openai']).optional(),
  voiceProvider: z.enum(['elevenlabs', 'openai']).optional(),
});

export const VALID_PROVIDERS = ['openai', 'anthropic', 'fal', 'elevenlabs', 'heygen'] as const;
export type Provider = (typeof VALID_PROVIDERS)[number];
