import { mockClaudeService } from '../helpers/mock-services';


describe('Claude Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate character profile with structured output', async () => {
    const profile = await mockClaudeService.generateCharacterProfile({
      niche: 'fitness',
      audience: '25-40 fitness enthusiasts',
      tone: 'motivational',
    });

    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('backstory');
    expect(profile).toHaveProperty('coreBeliefs');
    expect(profile).toHaveProperty('speakingStyle');
    expect(profile).toHaveProperty('antiKeywords');
    expect(profile).toHaveProperty('imagePrompt');
    expect(profile).toHaveProperty('voicePrompt');
  });

  it('should generate calendar with correct structure', async () => {
    const calendar = await mockClaudeService.generateCalendar({
      month: 3,
      year: 2026,
      postsPerDay: 2,
    });

    expect(calendar.weeklyThemes).toBeDefined();
    expect(Array.isArray(calendar.weeklyThemes)).toBe(true);
    expect(calendar.weeklyThemes.length).toBeGreaterThanOrEqual(4);
    expect(calendar.slots).toBeDefined();
    expect(Array.isArray(calendar.slots)).toBe(true);
  });

  it('should generate script with hook, body, and CTA', async () => {
    const script = await mockClaudeService.generateScript({
      slot: { emotionalTrigger: 'curiosity', weeklyTheme: 'Product Reviews' },
      character: { speakingStyle: 'Casual', antiKeywords: ['obviously'] },
    });

    expect(script.title).toBeDefined();
    expect(script.hook).toBeDefined();
    expect(script.body).toBeDefined();
    expect(script.cta).toBeDefined();
    expect(script.emotionalTrigger).toBeDefined();
  });

  it('should rewrite viral script maintaining character voice', async () => {
    const rewritten = await mockClaudeService.rewriteViralScript({
      sourceUrl: 'https://tiktok.com/video/123',
      character: {
        speakingStyle: 'Witty and casual',
        antiKeywords: ['literally'],
      },
    });

    expect(rewritten.title).toBeDefined();
    expect(rewritten.body).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    mockClaudeService.generateScript.mockRejectedValueOnce(
      new Error('Anthropic API: 529 Overloaded')
    );

    await expect(
      mockClaudeService.generateScript({})
    ).rejects.toThrow('Anthropic API: 529 Overloaded');
  });

  it('should handle rate limiting', async () => {
    mockClaudeService.generateCharacterProfile.mockRejectedValueOnce(
      new Error('Anthropic API: 429 Rate limit exceeded')
    );

    await expect(
      mockClaudeService.generateCharacterProfile({})
    ).rejects.toThrow('429 Rate limit');
  });

  it('should batch generate scripts', async () => {
    const results = await mockClaudeService.generateBatchScripts({
      slots: [
        { id: 'slot-1', emotionalTrigger: 'curiosity' },
        { id: 'slot-2', emotionalTrigger: 'surprise' },
      ],
      character: { speakingStyle: 'Casual' },
    });

    expect(results).toHaveLength(2);
    results.forEach((r: any) => {
      expect(r.title).toBeDefined();
      expect(r.body).toBeDefined();
    });
  });
});
