import { z } from 'zod';

export const createCalendarSchema = z.object({
  characterId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
  postsPerDay: z.number().int().min(1).max(10).default(2),
  themes: z.array(z.string()).optional(),
  strategyNotes: z.string().optional(),
});

export const generateCalendarSchema = z.object({
  characterId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
  postsPerDay: z.number().int().min(1).max(10).default(2),
});

export const updateCalendarSchema = z.object({
  strategyNotes: z.string().optional(),
  themes: z.array(z.string()).optional(),
  postsPerDay: z.number().int().min(1).max(10).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional(),
});
