import OpenAI from 'openai';
import { GeneratedProfile, GeneratedScript, GeneratedCalendar } from '../../types';
import { logger } from '../../utils/logger';

export class OpenAIService {
  private createClient(apiKey: string): OpenAI {
    return new OpenAI({ apiKey });
  }

  async generateCharacterProfile(apiKey: string, inputs: {
    name: string;
    niche: string;
    targetAudience: string;
    style?: string;
    inspirations?: string[];
  }): Promise<GeneratedProfile> {
    const client = this.createClient(apiKey);

    const systemPrompt = `You are an expert character designer for social media AI influencers. Your job is to create detailed, compelling character profiles that feel authentic and engaging. The character must have a clear personality, consistent voice, and relatable backstory that resonates with their target audience.

Always respond with valid JSON matching the exact schema requested. Do not include markdown formatting or code blocks.`;

    const userPrompt = `Create a complete character profile for a social media AI influencer with these inputs:

Name: ${inputs.name}
Niche: ${inputs.niche}
Target Audience: ${inputs.targetAudience}
${inputs.style ? `Visual Style: ${inputs.style}` : ''}
${inputs.inspirations?.length ? `Inspirations: ${inputs.inspirations.join(', ')}` : ''}

Return a JSON object with these exact fields:
{
  "name": "character name",
  "age": number (18-35),
  "originBackstory": "2-3 paragraph compelling origin story that explains why they create content",
  "coreBelief": "one sentence core belief that drives all their content",
  "personality": "detailed personality description covering traits, quirks, humor style",
  "speakingStyle": "how they talk: cadence, vocabulary, catchphrases, tone",
  "niche": "refined niche description",
  "targetAudience": "detailed audience persona",
  "imagePrompt": "detailed prompt for generating their appearance with Flux model, include ethnicity, features, clothing style, setting, lighting",
  "voicePrompt": "description of their voice for voice synthesis: accent, pitch, pace, energy level, vocal qualities",
  "antiKeywords": ["words", "they", "would", "never", "say"]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    logger.info('OpenAI character profile generated', { name: inputs.name });

    return JSON.parse(text) as GeneratedProfile;
  }

  async generateContentCalendar(apiKey: string, character: {
    name: string;
    niche: string;
    targetAudience: string;
    personality: string;
    speakingStyle: string;
    coreBelief: string;
  }, month: string, postsPerDay: number): Promise<GeneratedCalendar> {
    const client = this.createClient(apiKey);

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const systemPrompt = `You are a viral content strategist specializing in short-form video content. You create monthly content calendars that maximize engagement through strategic topic sequencing, emotional hooks, and trend awareness.

Always respond with valid JSON matching the exact schema requested. Do not include markdown formatting or code blocks.`;

    const userPrompt = `Create a content calendar for ${month} (${daysInMonth} days) for this character:

Name: ${character.name}
Niche: ${character.niche}
Target Audience: ${character.targetAudience}
Personality: ${character.personality}
Speaking Style: ${character.speakingStyle}
Core Belief: ${character.coreBelief}

Posts per day: ${postsPerDay}

Return a JSON object:
{
  "month": "${month}",
  "strategyNotes": "overall strategy for this month",
  "themes": ["weekly theme 1", "weekly theme 2", "weekly theme 3", "weekly theme 4"],
  "slots": [
    {
      "scheduledDate": "YYYY-MM-DD",
      "scheduledTime": "HH:MM",
      "dayOfWeek": "Monday",
      "slotNumber": 1,
      "contentType": "SHORT_FORM",
      "topic": "specific topic",
      "hook": "attention-grabbing first line",
      "emotionalTrigger": "curiosity|fear|inspiration|humor|shock|relatability",
      "cta": "call to action",
      "platform": "TIKTOK"
    }
  ]
}

Generate ${daysInMonth * postsPerDay} slots total. Vary topics, emotional triggers, and hooks.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 8000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    logger.info('OpenAI calendar generated', { month, character: character.name });

    return JSON.parse(text) as GeneratedCalendar;
  }

  async generateScript(apiKey: string, character: {
    name: string;
    personality: string;
    speakingStyle: string;
    coreBelief: string;
    niche: string;
    antiKeywords: string[];
  }, slot: {
    topic: string;
    hook?: string;
    emotionalTrigger?: string;
    cta?: string;
    platform?: string;
  }): Promise<GeneratedScript> {
    const client = this.createClient(apiKey);

    const systemPrompt = `You are a viral script writer. You write short-form video scripts (30-60 seconds) that hook viewers in the first 2 seconds, deliver value, and drive engagement. Every script must feel authentic to the character's voice and never use their anti-keywords.

Always respond with valid JSON matching the exact schema requested. Do not include markdown formatting or code blocks.`;

    const userPrompt = `Write a viral short-form video script for this character:

Character: ${character.name}
Personality: ${character.personality}
Speaking Style: ${character.speakingStyle}
Core Belief: ${character.coreBelief}
Niche: ${character.niche}
NEVER use these words: ${character.antiKeywords.join(', ')}

Content Brief:
Topic: ${slot.topic}
${slot.hook ? `Suggested Hook: ${slot.hook}` : ''}
${slot.emotionalTrigger ? `Emotional Trigger: ${slot.emotionalTrigger}` : ''}
${slot.cta ? `CTA: ${slot.cta}` : ''}
Platform: ${slot.platform || 'TikTok'}

Return a JSON object:
{
  "title": "short title for internal reference",
  "hook": "the opening line that hooks viewers (first 2 seconds)",
  "body": "the main content of the script",
  "cta": "the call to action at the end",
  "fullScript": "complete script combining hook + body + cta with natural transitions",
  "emotionalTrigger": "the primary emotional trigger used",
  "estimatedDurationSeconds": number (target 30-60),
  "wordCount": number
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    logger.info('OpenAI script generated', { topic: slot.topic });

    return JSON.parse(text) as GeneratedScript;
  }

  async generateCharacterImage(apiKey: string, prompt: string, count: number = 4): Promise<{ images: { url: string; seed: number }[] }> {
    const client = this.createClient(apiKey);

    // DALL-E 3 supports n=1 only, so parallel calls
    const promises = Array.from({ length: count }, (_, i) =>
      client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1792',
        quality: 'hd',
      }).then((res) => ({
        url: res.data?.[0]?.url || '',
        seed: i,
      }))
    );

    const images = await Promise.all(promises);
    logger.info('OpenAI images generated', { count });

    return { images };
  }

  async textToSpeech(apiKey: string, text: string, voice: string = 'nova'): Promise<Buffer> {
    const client = this.createClient(apiKey);

    const response = await client.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as any,
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    logger.info('OpenAI TTS generated', { textLength: text.length, voice });

    return Buffer.from(arrayBuffer);
  }
}

export const openaiService = new OpenAIService();
