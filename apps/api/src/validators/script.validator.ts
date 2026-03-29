import { z } from 'zod';

export const generateScriptSchema = z.object({
  characterId: z.string().uuid(),
  slotId: z.string().uuid().optional(),
  topic: z.string().min(1),
  hook: z.string().optional(),
  emotionalTrigger: z.string().optional(),
  cta: z.string().optional(),
  targetPlatform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN']).default('TIKTOK'),
});

export const rewriteScriptSchema = z.object({
  characterId: z.string().uuid(),
  originalScript: z.string().min(1),
  sourceReference: z.string().optional(),
});

export const updateScriptSchema = z.object({
  title: z.string().optional(),
  fullScript: z.string().optional(),
  hook: z.string().optional(),
  body: z.string().optional(),
  cta: z.string().optional(),
  emotionalTrigger: z.string().optional(),
  status: z.enum(['DRAFT', 'APPROVED', 'REJECTED', 'USED']).optional(),
});
