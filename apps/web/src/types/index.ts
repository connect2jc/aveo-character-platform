// ============================================================
// Database Schema Types
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  subscription_tier: 'starter' | 'growth' | 'pro';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  monthly_video_count: number;
  monthly_video_limit: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  age?: number;
  niche?: string;
  originBackstory?: string;
  coreBelief?: string;
  personality?: string;
  speakingStyle?: string;
  targetAudience?: string;
  baseImageUrl?: string;
  imagePrompt?: string;
  visualStyle?: string;
  elevenlabsVoiceId?: string;
  voicePrompt?: string;
  voiceSettings?: VoiceSettings;
  voiceSampleUrl?: string;
  antiKeywords: string[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  variations?: CharacterVariation[];
  _count?: { scripts: number; videos: number; calendars?: number };
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface CharacterVariation {
  id: string;
  character_id: string;
  variation_type: 'outfit' | 'expression' | 'pose' | 'background';
  image_url: string;
  prompt_used?: string;
  is_approved: boolean;
  created_at: string;
}

export interface ContentCalendar {
  id: string;
  character_id: string;
  month: number;
  year: number;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ContentSlot {
  id: string;
  calendar_id: string;
  scheduled_date: string;
  time_slot?: string;
  topic: string;
  hook?: string;
  script_id?: string;
  video_id?: string;
  platform: 'tiktok' | 'youtube_shorts' | 'instagram_reels' | 'all';
  status: 'planned' | 'scripted' | 'in_production' | 'ready' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  content_slot_id?: string;
  character_id: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  full_script: string;
  duration_estimate: number;
  status: 'draft' | 'approved' | 'revision_needed';
  revision_notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  script_id?: string;
  character_id: string;
  user_id: string;
  title: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  resolution: string;
  status: 'queued' | 'generating_audio' | 'generating_lipsync' | 'compositing' | 'ready' | 'failed';
  pipeline_metadata?: PipelineMetadata;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineMetadata {
  audio_job_id?: string;
  lipsync_job_id?: string;
  current_step?: string;
  progress?: number;
  started_at?: string;
  completed_at?: string;
}

export interface VideoClip {
  id: string;
  video_id: string;
  clip_type: 'hook' | 'body' | 'cta' | 'transition';
  sequence_order: number;
  audio_url?: string;
  video_clip_url?: string;
  duration?: number;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  resource_type: 'video' | 'character' | 'api_call';
  quantity: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

// ============================================================
// API Types
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================================
// Settings / BYOK Types
// ============================================================

export interface ApiKeyStatus {
  provider: string;
  hasKey: boolean;
  isValid: boolean;
  updatedAt: string | null;
}

export interface ProviderPreferences {
  scriptProvider: 'anthropic' | 'openai';
  imageProvider: 'fal' | 'openai';
  voiceProvider: 'elevenlabs' | 'openai';
}

// ============================================================
// Studio Types
// ============================================================

export interface StudioProject {
  id: string;
  userId: string;
  title: string;
  status: 'DRAFT' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  outputUrl?: string;
  thumbnailUrl?: string;
  totalDuration?: number;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
  tracks?: StudioTrack[];
}

export interface StudioTrack {
  id: string;
  projectId: string;
  type: 'video' | 'audio';
  sourceUrl: string;
  fileName?: string;
  startTime: number;
  duration?: number;
  trimStart: number;
  trimEnd?: number;
  volume: number;
  trackIndex: number;
  createdAt: string;
}

// ============================================================
// UI Types
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  characters: number;
  videos: number;
  distribution: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}
