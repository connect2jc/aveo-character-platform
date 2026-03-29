import { z } from 'zod';

export const createVideoSchema = z.object({
  characterId: z.string().uuid(),
  scriptId: z.string().uuid(),
  variationId: z.string().uuid().optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
});

export const updateVideoSchema = z.object({
  status: z.enum(['PENDING', 'GENERATING_AUDIO', 'GENERATING_CLIPS', 'STITCHING', 'QA_READY', 'APPROVED', 'PUBLISHED', 'FAILED']).optional(),
  qaNotes: z.string().optional(),
});
