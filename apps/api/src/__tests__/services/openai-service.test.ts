jest.mock('openai');

import { OpenAIService } from '../../services/ai/openai.service';
import OpenAI from 'openai';

const service = new OpenAIService();
const mockApiKey = 'sk-test-key';

const mockChatCreate = jest.fn();
const mockImagesGenerate = jest.fn();
const mockAudioSpeechCreate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
    chat: { completions: { create: mockChatCreate } },
    images: { generate: mockImagesGenerate },
    audio: { speech: { create: mockAudioSpeechCreate } },
  }));
});

describe('OpenAIService', () => {
  describe('generateCharacterProfile', () => {
    it('should call GPT-4o with json_object format and return parsed profile', async () => {
      const mockProfile = {
        name: 'Luna AI',
        age: 25,
        originBackstory: 'A tech reviewer from Silicon Valley',
        coreBelief: 'Tech should be accessible',
        personality: 'Witty and energetic',
        speakingStyle: 'Casual with tech jargon',
        niche: 'Tech reviews',
        targetAudience: '18-35 tech fans',
        imagePrompt: 'Young woman, short dark hair',
        voicePrompt: 'Energetic female voice',
        antiKeywords: ['obviously', 'game-changer'],
      };

      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockProfile) } }],
      });

      const result = await service.generateCharacterProfile(mockApiKey, {
        name: 'Luna AI',
        niche: 'tech_reviews',
        targetAudience: '18-35 tech enthusiasts',
        style: 'modern',
        inspirations: ['MKBHD', 'Linus'],
      });

      expect(OpenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(mockChatCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
        })
      );
      expect(result).toEqual(mockProfile);
    });

    it('should handle missing optional inputs', async () => {
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: '{"name":"Test"}' } }],
      });

      const result = await service.generateCharacterProfile(mockApiKey, {
        name: 'Test',
        niche: 'fitness',
        targetAudience: 'gym goers',
      });

      expect(result).toEqual({ name: 'Test' });
    });
  });

  describe('generateContentCalendar', () => {
    it('should generate calendar for given month', async () => {
      const mockCalendar = {
        month: '2026-03',
        strategyNotes: 'Focus on trends',
        themes: ['Reviews', 'Tips'],
        slots: [{ scheduledDate: '2026-03-01', topic: 'Test' }],
      };

      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockCalendar) } }],
      });

      const result = await service.generateContentCalendar(
        mockApiKey,
        {
          name: 'Luna',
          niche: 'tech',
          targetAudience: 'devs',
          personality: 'witty',
          speakingStyle: 'casual',
          coreBelief: 'tech for all',
        },
        '2026-03',
        2
      );

      expect(result).toEqual(mockCalendar);
      expect(mockChatCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-4o', max_tokens: 8000 })
      );
    });
  });

  describe('generateScript', () => {
    it('should generate script with character context', async () => {
      const mockScript = {
        title: 'Test Script',
        hook: 'Hook line',
        body: 'Body content',
        cta: 'Follow me',
        fullScript: 'Hook line. Body content. Follow me.',
        emotionalTrigger: 'curiosity',
        estimatedDurationSeconds: 45,
        wordCount: 120,
      };

      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockScript) } }],
      });

      const result = await service.generateScript(
        mockApiKey,
        {
          name: 'Luna',
          personality: 'witty',
          speakingStyle: 'casual',
          coreBelief: 'tech for all',
          niche: 'tech',
          antiKeywords: ['obviously'],
        },
        { topic: 'New iPhone', hook: 'Overrated?', emotionalTrigger: 'contrarian', cta: 'Comment below' }
      );

      expect(result).toEqual(mockScript);
    });

    it('should use default platform TikTok', async () => {
      mockChatCreate.mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });

      await service.generateScript(
        mockApiKey,
        { name: 'T', personality: 'x', speakingStyle: 'x', coreBelief: 'x', niche: 'x', antiKeywords: [] },
        { topic: 'Test' }
      );

      const callArgs = mockChatCreate.mock.calls[0][0];
      const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
      expect(userMsg.content).toContain('TikTok');
    });
  });

  describe('generateCharacterImage', () => {
    it('should make parallel DALL-E 3 calls and return images', async () => {
      mockImagesGenerate.mockResolvedValue({
        data: [{ url: 'https://dalle.example.com/img.png' }],
      });

      const result = await service.generateCharacterImage(mockApiKey, 'a young woman with dark hair', 4);

      expect(mockImagesGenerate).toHaveBeenCalledTimes(4);
      expect(mockImagesGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dall-e-3',
          n: 1,
          size: '1024x1792',
          quality: 'hd',
        })
      );
      expect(result.images).toHaveLength(4);
      expect(result.images[0].url).toBe('https://dalle.example.com/img.png');
    });

    it('should default to 4 images', async () => {
      mockImagesGenerate.mockResolvedValue({ data: [{ url: 'https://img.png' }] });

      const result = await service.generateCharacterImage(mockApiKey, 'prompt');
      expect(mockImagesGenerate).toHaveBeenCalledTimes(4);
      expect(result.images).toHaveLength(4);
    });

    it('should handle empty data gracefully', async () => {
      mockImagesGenerate.mockResolvedValue({ data: [] });

      const result = await service.generateCharacterImage(mockApiKey, 'prompt', 1);
      expect(result.images[0].url).toBe('');
    });
  });

  describe('textToSpeech', () => {
    it('should call TTS with correct params and return buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(100);
      mockAudioSpeechCreate.mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      });

      const result = await service.textToSpeech(mockApiKey, 'Hello world', 'nova');

      expect(mockAudioSpeechCreate).toHaveBeenCalledWith({
        model: 'tts-1-hd',
        voice: 'nova',
        input: 'Hello world',
      });
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should default to nova voice', async () => {
      const mockArrayBuffer = new ArrayBuffer(10);
      mockAudioSpeechCreate.mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      });

      await service.textToSpeech(mockApiKey, 'Test text');

      expect(mockAudioSpeechCreate).toHaveBeenCalledWith(
        expect.objectContaining({ voice: 'nova' })
      );
    });
  });
});
