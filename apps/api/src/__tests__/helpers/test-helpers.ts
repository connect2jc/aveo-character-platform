import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key';

export type PlanType = 'starter' | 'growth' | 'pro' | 'enterprise';

export const PLAN_LIMITS = {
  starter: { characters: 1, videosPerMonth: 30 },
  growth: { characters: 3, videosPerMonth: 90 },
  pro: { characters: 10, videosPerMonth: 300 },
  enterprise: { characters: 50, videosPerMonth: 1000 },
};

export function generateTestToken(
  userId: string = 'test-user-id',
  plan: PlanType = 'starter',
  role: string = 'user'
): string {
  return jwt.sign(
    { userId, plan, role, email: `${userId}@test.com` },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateExpiredToken(userId: string = 'test-user-id'): string {
  return jwt.sign(
    { userId, plan: 'starter', role: 'user' },
    JWT_SECRET,
    { expiresIn: '0s' }
  );
}

export function generateRefreshToken(userId: string = 'test-user-id'): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function generateExpiredRefreshToken(userId: string = 'test-user-id'): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: '0s',
  });
}

export function generateAdminToken(userId: string = 'admin-user-id'): string {
  return jwt.sign(
    { userId, plan: 'enterprise', role: 'admin', email: 'admin@aveo.tv' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function createTestUser(overrides: Partial<any> = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    passwordHash: '$2b$10$fakehashforpasswordtesting1234567890abcdef',
    name: 'Test User',
    plan: 'starter' as PlanType,
    role: 'user',
    stripeCustomerId: 'cus_test_123',
    onboardingCompleted: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function createTestCharacter(overrides: Partial<any> = {}) {
  return {
    id: 'test-character-id',
    userId: 'test-user-id',
    name: 'Luna AI',
    niche: 'tech_reviews',
    audience: '18-35 tech enthusiasts',
    backstory: 'A witty tech reviewer who grew up in Silicon Valley.',
    coreBeliefs: ['Technology should be accessible', 'Honesty in reviews'],
    speakingStyle: 'Casual, witty, with tech jargon sprinkled in',
    antiKeywords: ['obviously', 'game-changer', 'revolutionary'],
    imagePrompt: 'A young woman with short dark hair, modern outfit, tech background',
    voicePrompt: 'Young female, energetic, slight California accent',
    selectedImageUrl: 'https://storage.example.com/characters/luna-main.png',
    selectedVoiceId: 'voice_abc123',
    status: 'active',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    ...overrides,
  };
}

export function createTestScript(overrides: Partial<any> = {}) {
  return {
    id: 'test-script-id',
    contentSlotId: 'test-slot-id',
    characterId: 'test-character-id',
    userId: 'test-user-id',
    title: 'Why the new iPhone camera is overrated',
    body: 'Hey everyone, Luna here. Let me tell you about the latest iPhone camera hype. Spoiler alert: it is not what they want you to think. The megapixel count went up, sure, but real-world performance? Let me break it down with actual test shots.',
    hook: 'Spoiler alert: the new iPhone camera is NOT what they want you to think.',
    cta: 'Drop a comment if you agree, and follow for more honest tech takes.',
    emotionalTrigger: 'contrarian_insight',
    status: 'draft',
    generationMethod: 'ai_generated',
    sourceReference: null,
    reviewedAt: null,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
    ...overrides,
  };
}

export function createTestVideo(overrides: Partial<any> = {}) {
  return {
    id: 'test-video-id',
    scriptId: 'test-script-id',
    characterId: 'test-character-id',
    userId: 'test-user-id',
    status: 'processing',
    totalClips: 3,
    completedClips: 0,
    outputUrl9x16: null,
    outputUrl1x1: null,
    outputUrl4x5: null,
    thumbnailUrl: null,
    durationSeconds: null,
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function createTestContentSlot(overrides: Partial<any> = {}) {
  return {
    id: 'test-slot-id',
    calendarId: 'test-calendar-id',
    characterId: 'test-character-id',
    userId: 'test-user-id',
    date: new Date('2026-03-15'),
    dayOfWeek: 'Saturday',
    slotNumber: 1,
    weeklyTheme: 'Product Reviews',
    emotionalTrigger: 'curiosity',
    scriptId: null,
    status: 'pending',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
    ...overrides,
  };
}

export function createTestCalendar(overrides: Partial<any> = {}) {
  return {
    id: 'test-calendar-id',
    characterId: 'test-character-id',
    userId: 'test-user-id',
    month: 3,
    year: 2026,
    postsPerDay: 2,
    totalSlots: 62,
    generatedScripts: 0,
    status: 'active',
    weeklyThemes: [
      'Product Reviews',
      'Behind the Scenes',
      'Tips & Tricks',
      'Industry News',
    ],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
    ...overrides,
  };
}

export function createTestVideoClip(overrides: Partial<any> = {}) {
  return {
    id: 'test-clip-id',
    videoId: 'test-video-id',
    clipIndex: 0,
    scriptSegment: 'Hey everyone, Luna here.',
    audioUrl: 'https://storage.example.com/audio/clip-0.mp3',
    videoUrl: 'https://storage.example.com/clips/clip-0.mp4',
    variationId: 'test-variation-id',
    durationSeconds: 4.5,
    status: 'complete',
    retryCount: 0,
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function createTestPlatformConnection(overrides: Partial<any> = {}) {
  return {
    id: 'test-connection-id',
    userId: 'test-user-id',
    platform: 'youtube',
    accessToken: 'ya29.test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: new Date(Date.now() + 3600000),
    channelId: 'UC_test_channel',
    channelName: 'Luna AI Tech',
    connected: true,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
    ...overrides,
  };
}
