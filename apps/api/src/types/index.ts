import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  plan: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ScriptSegment {
  index: number;
  text: string;
  estimatedDuration: number;
}

export interface CalendarSlotInput {
  scheduledDate: string;
  scheduledTime?: string;
  dayOfWeek?: string;
  slotNumber: number;
  contentType: string;
  topic: string;
  hook: string;
  emotionalTrigger?: string;
  cta?: string;
  platform?: string;
}

export interface GeneratedProfile {
  name: string;
  age: number;
  originBackstory: string;
  coreBelief: string;
  personality: string;
  speakingStyle: string;
  niche: string;
  targetAudience: string;
  imagePrompt: string;
  voicePrompt: string;
  antiKeywords: string[];
}

export interface GeneratedCalendar {
  month: string;
  strategyNotes: string;
  themes: string[];
  slots: CalendarSlotInput[];
}

export interface GeneratedScript {
  title: string;
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  emotionalTrigger: string;
  estimatedDurationSeconds: number;
  wordCount: number;
}
