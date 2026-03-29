import {
  createProjectSchema,
  updateProjectSchema,
  addTrackSchema,
  updateTrackSchema,
} from '../../validators/studio.validator';

describe('Studio Validators', () => {
  describe('createProjectSchema', () => {
    it('should accept valid project', () => {
      expect(createProjectSchema.safeParse({ title: 'My Project' }).success).toBe(true);
    });

    it('should accept project with aspect ratio', () => {
      expect(createProjectSchema.safeParse({ title: 'My Project', aspectRatio: '16:9' }).success).toBe(true);
    });

    it('should reject empty title', () => {
      expect(createProjectSchema.safeParse({ title: '' }).success).toBe(false);
    });

    it('should reject title over 200 chars', () => {
      expect(createProjectSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(false);
    });

    it('should reject invalid aspect ratio', () => {
      expect(createProjectSchema.safeParse({ title: 'T', aspectRatio: '4:3' }).success).toBe(false);
    });

    it('should accept all valid aspect ratios', () => {
      for (const ar of ['9:16', '16:9', '1:1']) {
        expect(createProjectSchema.safeParse({ title: 'T', aspectRatio: ar }).success).toBe(true);
      }
    });
  });

  describe('updateProjectSchema', () => {
    it('should accept partial updates', () => {
      expect(updateProjectSchema.safeParse({ title: 'New Title' }).success).toBe(true);
      expect(updateProjectSchema.safeParse({ aspectRatio: '1:1' }).success).toBe(true);
      expect(updateProjectSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('addTrackSchema', () => {
    it('should accept valid video track', () => {
      const result = addTrackSchema.safeParse({
        type: 'video',
        sourceUrl: 'https://example.com/video.mp4',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid audio track with all fields', () => {
      const result = addTrackSchema.safeParse({
        type: 'audio',
        sourceUrl: 'https://example.com/audio.mp3',
        fileName: 'audio.mp3',
        startTime: 5,
        duration: 30,
        trimStart: 2,
        trimEnd: 28,
        volume: 0.8,
        trackIndex: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      expect(addTrackSchema.safeParse({ type: 'image', sourceUrl: 'https://x.com/a' }).success).toBe(false);
    });

    it('should reject invalid URL', () => {
      expect(addTrackSchema.safeParse({ type: 'video', sourceUrl: 'not-a-url' }).success).toBe(false);
    });

    it('should reject negative startTime', () => {
      expect(
        addTrackSchema.safeParse({ type: 'video', sourceUrl: 'https://x.com/a', startTime: -1 }).success
      ).toBe(false);
    });

    it('should reject volume above 1', () => {
      expect(
        addTrackSchema.safeParse({ type: 'video', sourceUrl: 'https://x.com/a', volume: 1.5 }).success
      ).toBe(false);
    });

    it('should reject negative volume', () => {
      expect(
        addTrackSchema.safeParse({ type: 'video', sourceUrl: 'https://x.com/a', volume: -0.1 }).success
      ).toBe(false);
    });

    it('should reject non-integer trackIndex', () => {
      expect(
        addTrackSchema.safeParse({ type: 'video', sourceUrl: 'https://x.com/a', trackIndex: 1.5 }).success
      ).toBe(false);
    });
  });

  describe('updateTrackSchema', () => {
    it('should accept partial track updates', () => {
      expect(updateTrackSchema.safeParse({ volume: 0.5 }).success).toBe(true);
      expect(updateTrackSchema.safeParse({ startTime: 10, trimStart: 2 }).success).toBe(true);
      expect(updateTrackSchema.safeParse({}).success).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(updateTrackSchema.safeParse({ volume: 2 }).success).toBe(false);
      expect(updateTrackSchema.safeParse({ startTime: -5 }).success).toBe(false);
    });
  });
});
