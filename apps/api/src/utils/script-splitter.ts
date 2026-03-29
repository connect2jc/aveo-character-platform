import { ScriptSegment } from '../types';

const WORDS_PER_SECOND = 2.5;
const MAX_SEGMENT_SECONDS = 15;
const MAX_SEGMENT_WORDS = Math.floor(MAX_SEGMENT_SECONDS * WORDS_PER_SECOND);

export function splitScript(fullScript: string): ScriptSegment[] {
  const sentences = fullScript
    .replace(/([.!?])\s+/g, '$1|||')
    .split('|||')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const segments: ScriptSegment[] = [];
  let currentSegment = '';
  let segmentIndex = 0;

  for (const sentence of sentences) {
    const combined = currentSegment ? `${currentSegment} ${sentence}` : sentence;
    const wordCount = combined.split(/\s+/).length;

    if (wordCount > MAX_SEGMENT_WORDS && currentSegment) {
      const currentWords = currentSegment.split(/\s+/).length;
      segments.push({
        index: segmentIndex,
        text: currentSegment.trim(),
        estimatedDuration: Math.round(currentWords / WORDS_PER_SECOND * 10) / 10,
      });
      segmentIndex++;
      currentSegment = sentence;
    } else {
      currentSegment = combined;
    }
  }

  if (currentSegment.trim()) {
    const wordCount = currentSegment.split(/\s+/).length;
    segments.push({
      index: segmentIndex,
      text: currentSegment.trim(),
      estimatedDuration: Math.round(wordCount / WORDS_PER_SECOND * 10) / 10,
    });
  }

  return segments;
}

export function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.round(words / WORDS_PER_SECOND);
}
