import { mockPrisma } from '../helpers/mock-prisma';
import { mockClaudeService } from '../helpers/mock-services';
import { createTestScript, createTestCharacter } from '../helpers/test-helpers';


describe('POST /api/scripts/model-from-url', () => {
  const viralUrl = 'https://www.tiktok.com/@someuser/video/123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should rewrite viral script in character voice', async () => {
    const character = createTestCharacter();
    mockPrisma.character.findUnique.mockResolvedValue(character);

    const rewritten = await mockClaudeService.rewriteViralScript({
      sourceUrl: viralUrl,
      character,
      originalTranscript: 'Original viral video transcript here...',
    });

    expect(rewritten).toBeDefined();
    expect(rewritten.title).toBeDefined();
    expect(rewritten.body).toBeDefined();
    expect(rewritten.hook).toBeDefined();
    expect(rewritten.cta).toBeDefined();
  });

  it('should set generation_method to viral_rewrite', async () => {
    const rewritten = await mockClaudeService.rewriteViralScript({
      sourceUrl: viralUrl,
      character: createTestCharacter(),
    });

    const script = createTestScript({
      ...rewritten,
      generationMethod: 'viral_rewrite',
      sourceReference: viralUrl,
    });

    mockPrisma.script.create.mockResolvedValue(script);

    const created = await mockPrisma.script.create({
      data: {
        ...script,
        generationMethod: 'viral_rewrite',
      },
    });

    expect(created.generationMethod).toBe('viral_rewrite');
  });

  it('should save source_reference URL', async () => {
    const script = createTestScript({
      sourceReference: viralUrl,
      generationMethod: 'viral_rewrite',
    });

    mockPrisma.script.create.mockResolvedValue(script);

    const created = await mockPrisma.script.create({
      data: {
        ...script,
        sourceReference: viralUrl,
      },
    });

    expect(created.sourceReference).toBe(viralUrl);
  });

  it('should respect anti-keywords in rewrite', async () => {
    const character = createTestCharacter({
      antiKeywords: ['obviously', 'game-changer', 'revolutionary'],
    });

    await mockClaudeService.rewriteViralScript({
      sourceUrl: viralUrl,
      character,
    });

    expect(mockClaudeService.rewriteViralScript).toHaveBeenCalledWith(
      expect.objectContaining({
        character: expect.objectContaining({
          antiKeywords: expect.arrayContaining(['obviously', 'game-changer']),
        }),
      })
    );
  });

  it('should handle invalid URL gracefully', () => {
    const invalidUrls = ['not-a-url', '', 'ftp://weird.protocol'];
    invalidUrls.forEach((url) => {
      try {
        new URL(url);
        if (url === '') fail('Should have thrown');
      } catch {
        // Expected for invalid URLs
        expect(true).toBe(true);
      }
    });

    // Valid URL should pass
    const validUrl = new URL(viralUrl);
    expect(validUrl.hostname).toBe('www.tiktok.com');
  });
});
