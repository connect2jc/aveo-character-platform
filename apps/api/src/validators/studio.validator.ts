import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).optional(),
});

export const addTrackSchema = z.object({
  type: z.enum(['video', 'audio']),
  sourceUrl: z.string().url(),
  fileName: z.string().optional(),
  startTime: z.number().min(0).optional(),
  duration: z.number().positive().optional(),
  trimStart: z.number().min(0).optional(),
  trimEnd: z.number().positive().optional(),
  volume: z.number().min(0).max(1).optional(),
  trackIndex: z.number().int().min(0).optional(),
});

export const updateTrackSchema = z.object({
  startTime: z.number().min(0).optional(),
  duration: z.number().positive().optional(),
  trimStart: z.number().min(0).optional(),
  trimEnd: z.number().positive().optional(),
  volume: z.number().min(0).max(1).optional(),
  trackIndex: z.number().int().min(0).optional(),
});

export const importVideoSchema = z.object({});
