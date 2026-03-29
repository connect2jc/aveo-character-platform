import { saveApiKeySchema, updatePreferencesSchema, VALID_PROVIDERS } from '../../validators/settings.validator';

describe('Settings Validators', () => {
  describe('saveApiKeySchema', () => {
    it('should accept valid API key', () => {
      const result = saveApiKeySchema.safeParse({ apiKey: 'sk-test-key-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty API key', () => {
      const result = saveApiKeySchema.safeParse({ apiKey: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing apiKey field', () => {
      const result = saveApiKeySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject non-string apiKey', () => {
      const result = saveApiKeySchema.safeParse({ apiKey: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe('updatePreferencesSchema', () => {
    it('should accept valid script provider', () => {
      expect(updatePreferencesSchema.safeParse({ scriptProvider: 'anthropic' }).success).toBe(true);
      expect(updatePreferencesSchema.safeParse({ scriptProvider: 'openai' }).success).toBe(true);
    });

    it('should accept valid image provider', () => {
      expect(updatePreferencesSchema.safeParse({ imageProvider: 'fal' }).success).toBe(true);
      expect(updatePreferencesSchema.safeParse({ imageProvider: 'openai' }).success).toBe(true);
    });

    it('should accept valid voice provider', () => {
      expect(updatePreferencesSchema.safeParse({ voiceProvider: 'elevenlabs' }).success).toBe(true);
      expect(updatePreferencesSchema.safeParse({ voiceProvider: 'openai' }).success).toBe(true);
    });

    it('should reject invalid script provider', () => {
      expect(updatePreferencesSchema.safeParse({ scriptProvider: 'gpt4' }).success).toBe(false);
    });

    it('should reject invalid image provider', () => {
      expect(updatePreferencesSchema.safeParse({ imageProvider: 'midjourney' }).success).toBe(false);
    });

    it('should reject invalid voice provider', () => {
      expect(updatePreferencesSchema.safeParse({ voiceProvider: 'amazon' }).success).toBe(false);
    });

    it('should accept empty object (all optional)', () => {
      expect(updatePreferencesSchema.safeParse({}).success).toBe(true);
    });

    it('should accept multiple preferences at once', () => {
      const result = updatePreferencesSchema.safeParse({
        scriptProvider: 'openai',
        imageProvider: 'openai',
        voiceProvider: 'openai',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('VALID_PROVIDERS', () => {
    it('should contain all expected providers', () => {
      expect(VALID_PROVIDERS).toEqual(['openai', 'anthropic', 'fal', 'elevenlabs', 'heygen']);
    });
  });
});
