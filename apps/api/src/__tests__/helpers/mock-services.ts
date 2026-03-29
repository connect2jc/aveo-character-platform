// Mock Claude/Anthropic Service
export const mockClaudeService = {
  generateCharacterProfile: jest.fn().mockResolvedValue({
    name: 'Luna AI',
    backstory:
      'A witty tech reviewer who grew up in Silicon Valley, surrounded by innovation from a young age.',
    coreBeliefs: [
      'Technology should be accessible to everyone',
      'Honesty matters more than hype',
      'Real-world testing beats spec sheets',
    ],
    speakingStyle:
      'Casual and energetic, uses tech jargon but always explains it. Loves analogies. Never uses filler words.',
    antiKeywords: [
      'obviously',
      'game-changer',
      'revolutionary',
      'literally',
      'insane',
    ],
    imagePrompt:
      'A young woman in her mid-20s with short dark hair, wearing a casual tech-startup outfit, modern minimalist background with subtle neon lighting',
    voicePrompt:
      'Young female voice, energetic and confident, slight California accent, natural conversational tone',
  }),

  generateCalendar: jest.fn().mockResolvedValue({
    weeklyThemes: [
      'Product Reviews',
      'Behind the Scenes',
      'Tips & Tricks',
      'Industry News',
    ],
    slots: Array.from({ length: 62 }, (_, i) => ({
      date: `2026-03-${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
      slotNumber: (i % 2) + 1,
      weeklyTheme: ['Product Reviews', 'Behind the Scenes', 'Tips & Tricks', 'Industry News'][Math.floor(i / 14) % 4],
      emotionalTrigger: ['curiosity', 'surprise', 'nostalgia', 'humor', 'empathy'][i % 5],
    })),
  }),

  generateScript: jest.fn().mockResolvedValue({
    title: 'Why the new iPhone camera is overrated',
    hook: 'Spoiler alert: the new iPhone camera is NOT what they want you to think.',
    body: 'Hey everyone, Luna here. Let me tell you about the latest iPhone camera hype. The megapixel count went up, sure, but real-world performance tells a different story. I ran side-by-side tests, and the results might shock you.',
    cta: 'Drop a comment if you agree, and follow for more honest tech takes.',
    emotionalTrigger: 'contrarian_insight',
  }),

  rewriteViralScript: jest.fn().mockResolvedValue({
    title: 'My take on the viral camera test',
    hook: 'Everyone is talking about this camera test, but they are missing the point.',
    body: 'You have probably seen that viral camera comparison going around. Here is what nobody is mentioning: the test conditions were completely different. Let me show you what a fair test actually looks like.',
    cta: 'Follow for takes that go beyond the clickbait.',
    emotionalTrigger: 'truth_reveal',
  }),

  generateBatchScripts: jest.fn().mockResolvedValue([
    {
      slotId: 'slot-1',
      title: 'Script 1',
      hook: 'Hook 1',
      body: 'Body 1',
      cta: 'CTA 1',
      emotionalTrigger: 'curiosity',
    },
    {
      slotId: 'slot-2',
      title: 'Script 2',
      hook: 'Hook 2',
      body: 'Body 2',
      cta: 'CTA 2',
      emotionalTrigger: 'surprise',
    },
  ]),
};

// Mock FAL Service (image generation)
export const mockFalService = {
  generateImages: jest.fn().mockResolvedValue({
    images: [
      { url: 'https://fal.media/files/img1.png', seed: 12345 },
      { url: 'https://fal.media/files/img2.png', seed: 23456 },
      { url: 'https://fal.media/files/img3.png', seed: 34567 },
      { url: 'https://fal.media/files/img4.png', seed: 45678 },
    ],
    cost: 0.04,
  }),

  generateVariations: jest.fn().mockResolvedValue({
    variations: [
      {
        url: 'https://fal.media/files/var1.png',
        type: 'outfit',
        description: 'Casual hoodie and jeans',
      },
      {
        url: 'https://fal.media/files/var2.png',
        type: 'location',
        description: 'Home office with LED lights',
      },
      {
        url: 'https://fal.media/files/var3.png',
        type: 'angle',
        description: 'Close-up face shot',
      },
    ],
    cost: 0.03,
  }),
};

// Mock ElevenLabs Service
export const mockElevenLabsService = {
  generateVoiceOptions: jest.fn().mockResolvedValue({
    voices: [
      {
        voiceId: 'voice_opt_1',
        name: 'Luna Voice A',
        sampleUrl: 'https://api.elevenlabs.io/samples/voice1.mp3',
        description: 'Energetic young female, California accent',
      },
      {
        voiceId: 'voice_opt_2',
        name: 'Luna Voice B',
        sampleUrl: 'https://api.elevenlabs.io/samples/voice2.mp3',
        description: 'Calm young female, neutral accent',
      },
      {
        voiceId: 'voice_opt_3',
        name: 'Luna Voice C',
        sampleUrl: 'https://api.elevenlabs.io/samples/voice3.mp3',
        description: 'Upbeat young female, slight rasp',
      },
    ],
    cost: 0.15,
  }),

  generateAudio: jest.fn().mockResolvedValue({
    audioUrl: 'https://storage.example.com/audio/generated.mp3',
    durationSeconds: 12.5,
    cost: 0.02,
  }),
};

// Mock HeyGen Service
export const mockHeyGenService = {
  createTalkingHeadVideo: jest.fn().mockResolvedValue({
    jobId: 'heygen_job_abc123',
    status: 'processing',
    estimatedDuration: 45,
  }),

  checkJobStatus: jest.fn().mockResolvedValue({
    jobId: 'heygen_job_abc123',
    status: 'complete',
    videoUrl: 'https://files.heygen.ai/video/output.mp4',
    durationSeconds: 14.2,
  }),

  getVideoUrl: jest.fn().mockResolvedValue({
    url: 'https://files.heygen.ai/video/output.mp4',
    cost: 0.10,
  }),
};

// Mock Stripe Service
export const mockStripeService = {
  createCustomer: jest.fn().mockResolvedValue({
    id: 'cus_test_new_123',
    email: 'test@example.com',
  }),

  createSubscription: jest.fn().mockResolvedValue({
    id: 'sub_test_123',
    status: 'active',
    currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 86400,
  }),

  updateSubscription: jest.fn().mockResolvedValue({
    id: 'sub_test_123',
    status: 'active',
  }),

  constructWebhookEvent: jest.fn(),

  cancelSubscription: jest.fn().mockResolvedValue({
    id: 'sub_test_123',
    status: 'canceled',
  }),
};

// Mock S3 Service
export const mockS3Service = {
  upload: jest.fn().mockResolvedValue({
    url: 'https://test-bucket.s3.amazonaws.com/uploaded-file.mp4',
    key: 'uploaded-file.mp4',
  }),

  getSignedUrl: jest.fn().mockResolvedValue(
    'https://test-bucket.s3.amazonaws.com/file.mp4?signed=true'
  ),

  deleteObject: jest.fn().mockResolvedValue(undefined),
};

// Mock BullMQ
export const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-123', name: 'test-job' }),
  getJob: jest.fn(),
  getJobs: jest.fn().mockResolvedValue([]),
  getJobCounts: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 5,
    failed: 1,
  }),
  obliterate: jest.fn(),
  close: jest.fn(),
};

export const createMockQueue = () => ({ ...mockQueue });
