import { z } from 'zod';

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(1).max(150).optional(),
  originBackstory: z.string().optional(),
  coreBelief: z.string().optional(),
  personality: z.string().optional(),
  speakingStyle: z.string().optional(),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
  imagePrompt: z.string().optional(),
  visualStyle: z.string().optional(),
  voicePrompt: z.string().optional(),
  voiceSettings: z.record(z.string(), z.unknown()).optional(),
  heygenAvatarType: z.enum(['PHOTO', 'STUDIO']).optional(),
  antiKeywords: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export const generateProfileSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  targetAudience: z.string().min(1),
  style: z.string().optional(),
  inspirations: z.array(z.string()).optional(),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().optional(),
});

export const selectImageSchema = z.object({
  imageUrl: z.string().url(),
});

export const generateVariationsSchema = z.object({
  count: z.number().int().min(1).max(5).default(3),
  types: z.array(z.enum(['EXPRESSION', 'OUTFIT', 'BACKGROUND', 'ANGLE', 'STYLE'])).optional(),
});

export const generateVoiceSchema = z.object({
  prompt: z.string().min(1),
});

export const testVoiceSchema = z.object({
  voiceId: z.string().min(1),
  text: z.string().min(1).max(500),
});

export const selectVoiceSchema = z.object({
  voiceId: z.string().min(1),
  voiceSettings: z.record(z.string(), z.unknown()).optional(),
});
