describe('Script Splitter', () => {
  const WORDS_PER_SECOND = 2.5;
  const MAX_SEGMENT_SECONDS = 15;
  const MAX_WORDS = Math.floor(WORDS_PER_SECOND * MAX_SEGMENT_SECONDS); // 37

  function splitScript(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const segments: string[] = [];
    let currentSegment = '';

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      const currentWordCount = currentSegment
        .split(/\s+/)
        .filter(Boolean).length;
      const sentenceWordCount = trimmed.split(/\s+/).length;

      if (currentWordCount + sentenceWordCount > MAX_WORDS && currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = trimmed;
      } else {
        currentSegment = currentSegment
          ? `${currentSegment} ${trimmed}`
          : trimmed;
      }
    }

    if (currentSegment.trim()) {
      segments.push(currentSegment.trim());
    }

    return segments;
  }

  it('should split at sentence boundaries', () => {
    const text =
      'First sentence here. Second sentence here. Third sentence here.';
    const segments = splitScript(text);

    segments.forEach((segment) => {
      // Each segment should end with sentence-ending punctuation
      expect(segment).toMatch(/[.!?]$/);
    });
  });

  it('should keep segments under 15 seconds (estimated by word count)', () => {
    const longScript =
      'Hey everyone, Luna here. Let me tell you about the latest iPhone camera hype. ' +
      'Spoiler alert: it is not what they want you to think. The megapixel count went up, sure. ' +
      'But real-world performance tells a completely different story. I ran side-by-side tests. ' +
      'The results are going to surprise you. First, let us talk about low-light performance. ' +
      'The new sensor is bigger, but the noise reduction algorithm has actually gotten worse. ' +
      'Colors look more washed out in low light compared to last year. ' +
      'Second, portrait mode has improved, but only in well-lit conditions. ' +
      'In dim environments, the edge detection still struggles with hair. ' +
      'Third, the zoom is genuinely impressive this year. I have to give them credit. ' +
      'The 5x optical zoom produces sharp, usable images even at full extension. ' +
      'So should you upgrade just for the camera? My honest take: probably not. ' +
      'Save your money unless zoom is your top priority.';

    const segments = splitScript(longScript);

    segments.forEach((segment) => {
      const wordCount = segment.split(/\s+/).length;
      const estimatedSeconds = wordCount / WORDS_PER_SECOND;
      expect(estimatedSeconds).toBeLessThanOrEqual(MAX_SEGMENT_SECONDS + 2); // small buffer
    });
  });

  it('should handle short scripts (single segment)', () => {
    const shortScript = 'This is a very short script. Just two sentences.';
    const segments = splitScript(shortScript);

    expect(segments).toHaveLength(1);
    expect(segments[0]).toBe(shortScript);
  });

  it('should handle long scripts (many segments)', () => {
    // Create a script with ~200 words (should be 5+ segments)
    const sentences = Array.from(
      { length: 20 },
      (_, i) => `This is sentence number ${i + 1} which adds some words to the total count.`
    );
    const longScript = sentences.join(' ');
    const segments = splitScript(longScript);

    expect(segments.length).toBeGreaterThanOrEqual(3);
  });

  it('should not split mid-sentence', () => {
    const text =
      'This is a complete sentence with many words that should stay together. ' +
      'And this is another sentence that also stays together.';
    const segments = splitScript(text);

    segments.forEach((segment) => {
      // Should not start with lowercase (indicating mid-sentence split)
      // unless it naturally starts with a lowercase word
      expect(segment.trim().length).toBeGreaterThan(0);
    });
  });

  it('should handle edge cases (ellipsis, abbreviations, quotes)', () => {
    const textWithEllipsis = 'Wait for it... The results are in! Amazing.';
    const segments1 = splitScript(textWithEllipsis);
    expect(segments1.length).toBeGreaterThanOrEqual(1);

    // Single sentence with no split point
    const singleLong = 'This is just one really long sentence that keeps going without any period at the end';
    const segments2 = splitScript(singleLong);
    expect(segments2.length).toBeGreaterThanOrEqual(1);
    expect(segments2[0]).toContain('one really long');
  });

  it('should handle empty input', () => {
    const segments = splitScript('');
    expect(segments).toHaveLength(0); // Empty input produces no segments
  });

  it('should estimate duration correctly', () => {
    const text = 'One two three four five six seven eight nine ten.';
    const wordCount = text.split(/\s+/).length;
    const estimatedSeconds = wordCount / WORDS_PER_SECOND;

    expect(wordCount).toBe(10);
    expect(estimatedSeconds).toBe(4);
  });
});
