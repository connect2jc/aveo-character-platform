// =============================================
// SHARED TYPES - Aveo CharacterAI Platform
// =============================================

// Plans & Pricing
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 79,
    characters: 1,
    videos: 30,
    postsPerDay: 1,
    distribution: 'manual',
    features: [
      '1 AI Character Brand',
      '30 Videos/Month (1/day)',
      'Content Calendar',
      'Manual Download',
      'All Video Formats (9:16, 1:1, 4:5)',
      'Burned-in Captions',
    ],
  },
  growth: {
    name: 'Growth',
    price: 199,
    characters: 3,
    videos: 90,
    postsPerDay: 3,
    distribution: '2 platforms',
    features: [
      '3 AI Character Brands',
      '90 Videos/Month (3/day)',
      'Content Calendar',
      'Auto-publish to 2 Platforms',
      'All Video Formats',
      'Burned-in Captions',
      'Priority Support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 499,
    characters: 10,
    videos: 300,
    postsPerDay: 10,
    distribution: 'unlimited',
    features: [
      '10 AI Character Brands',
      '300 Videos/Month (10/day)',
      'Content Calendar',
      'Auto-publish Unlimited Platforms',
      'All Video Formats',
      'Burned-in Captions',
      'Analytics Dashboard',
      'Priority Support',
      'Viral Script Modeling',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

// User
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: PlanType;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: 'active' | 'suspended' | 'cancelled';
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Character
export interface Character {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  originBackstory: string | null;
  coreBelief: string | null;
  personality: string | null;
  speakingStyle: string | null;
  niche: string | null;
  targetAudience: TargetAudience | null;
  baseImageUrl: string | null;
  imagePrompt: string | null;
  visualStyle: VisualStyle | null;
  elevenlabsVoiceId: string | null;
  voicePrompt: string | null;
  voiceSettings: VoiceSettings | null;
  voiceSampleUrl: string | null;
  heygenAvatarType: 'photo_to_video' | 'studio_avatar' | null;
  antiKeywords: string[];
  status: 'creating' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetAudience {
  demographics: string;
  painPoints: string[];
  desires: string[];
}

export interface VisualStyle {
  clothing: string;
  environment: string;
  cameraAngle: string;
  colorGrade: string;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
}

// Character Variation
export interface CharacterVariation {
  id: string;
  characterId: string;
  variationType: 'outfit' | 'location' | 'angle';
  imageUrl: string;
  imagePrompt: string | null;
  description: string | null;
  createdAt: Date;
}

// Content Calendar
export interface ContentCalendar {
  id: string;
  characterId: string;
  month: Date;
  strategyNotes: string | null;
  themes: string[];
  postsPerDay: number;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
}

// Content Slot
export interface ContentSlot {
  id: string;
  calendarId: string;
  characterId: string;
  scheduledDate: Date;
  scheduledTime: string | null;
  dayOfWeek: string | null;
  slotNumber: number | null;
  contentType: 'video' | 'story' | 'carousel';
  topic: string | null;
  hook: string | null;
  emotionalTrigger: EmotionalTrigger | null;
  cta: string | null;
  scriptId: string | null;
  videoId: string | null;
  platform: Platform | null;
  publishStatus: 'pending' | 'scheduled' | 'published' | 'failed';
  publishedAt: Date | null;
  publishedUrl: string | null;
  createdAt: Date;
}

export type EmotionalTrigger = 'anger' | 'confusion' | 'excitement' | 'fomo' | 'relief';
export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'youtube_shorts';

// Script
export interface Script {
  id: string;
  characterId: string;
  title: string | null;
  fullScript: string;
  hook: string | null;
  body: string | null;
  cta: string | null;
  emotionalTrigger: EmotionalTrigger | null;
  estimatedDurationSeconds: number | null;
  targetPlatform: Platform | null;
  wordCount: number | null;
  generationMethod: 'ai_generated' | 'viral_rewrite' | 'manual';
  sourceReference: string | null;
  claudePrompt: string | null;
  status: 'draft' | 'approved' | 'rejected' | 'produced';
  reviewedAt: Date | null;
  createdAt: Date;
}

// Video
export interface Video {
  id: string;
  characterId: string;
  scriptId: string;
  userId: string;
  clipCount: number;
  totalDurationSeconds: number | null;
  finalVideoUrl: string | null;
  thumbnailUrl: string | null;
  aspectRatio: '9:16' | '1:1' | '4:5' | null;
  resolution: '1080p' | '720p' | null;
  hasCaptions: boolean;
  variationId: string | null;
  status: VideoStatus;
  qaNotes: string | null;
  heygenCreditsUsed: number | null;
  elevenlabsCost: number | null;
  totalGenerationCost: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoStatus =
  | 'queued'
  | 'generating_audio'
  | 'generating_clips'
  | 'stitching'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'delivered';

// Video Clip
export interface VideoClip {
  id: string;
  videoId: string;
  clipIndex: number;
  scriptSegment: string;
  durationSeconds: number | null;
  audioUrl: string | null;
  heygenJobId: string | null;
  clipUrl: string | null;
  status: 'pending' | 'audio_generated' | 'video_generating' | 'video_complete' | 'failed';
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
}

// Usage Tracking
export interface UsageTracking {
  id: string;
  userId: string;
  month: Date;
  charactersAllowed: number;
  videosAllowed: number;
  charactersCreated: number;
  videosGenerated: number;
  videosPublished: number;
  scriptsGenerated: number;
  totalHeygenCost: number;
  totalElevenlabsCost: number;
  totalFalCost: number;
  totalClaudeCost: number;
}

// Platform Connection
export interface PlatformConnection {
  id: string;
  userId: string;
  platform: Platform;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  accountName: string | null;
  accountId: string | null;
}

// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'createdAt' | 'updatedAt'>;
  accessToken: string;
  refreshToken: string;
}

export interface CharacterWizardInput {
  niche: string;
  targetAudience: {
    ageRange: string;
    painPoints: string[];
    desires: string[];
  };
  characterConcept: {
    age: number;
    gender: string;
    emotionalRole: string;
  };
  toneAndPersonality: {
    tone: string[];
    personality: string[];
  };
}

export interface GeneratedProfile {
  name: string;
  age: number;
  originBackstory: string;
  coreBelief: string;
  personality: string;
  speakingStyle: string;
  antiKeywords: string[];
  imagePrompt: string;
  voicePrompt: string;
  visualStyle: VisualStyle;
}

export interface CalendarGenerationInput {
  month: string;
  postsPerDay: number;
  targetPlatforms: Platform[];
}

export interface GeneratedCalendar {
  strategyNotes: string;
  themes: string[];
  slots: {
    date: string;
    time: string;
    topic: string;
    hook: string;
    emotionalTrigger: EmotionalTrigger;
    cta: string;
    platform: Platform;
  }[];
}

// Video Pipeline Types
export interface ScriptSegment {
  index: number;
  text: string;
  estimatedDurationSeconds: number;
  wordCount: number;
}

export interface VideoProductionJob {
  videoId: string;
  scriptId: string;
  characterId: string;
  segments: ScriptSegment[];
}

// Cost tracking
export const COST_PER_VIDEO = {
  claude: 0.03,
  elevenlabs: 0.18,
  heygen_standard: 1.0,
  heygen_avatar_iv: 6.0,
  fal: 0.08,
  ffmpeg: 0.02,
} as const;

// Hook styles
export const HOOK_STYLES = [
  'question',
  'controversy',
  'statistic',
  'story',
  'comparison',
] as const;

export type HookStyle = (typeof HOOK_STYLES)[number];

// Niche options
export const NICHES = [
  'Health & Wellness',
  'Personal Finance',
  'Spirituality & Mindfulness',
  'Technology',
  'Relationships',
  'Fitness',
  'Mental Health',
  'Productivity',
  'Entrepreneurship',
  'Parenting',
  'Education',
  'Lifestyle',
] as const;

export type Niche = (typeof NICHES)[number];
