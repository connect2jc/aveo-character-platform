import { anthropic } from '../../config/claude';
import { GeneratedProfile, GeneratedScript, GeneratedCalendar } from '../../types';
import { logger } from '../../utils/logger';

export class ClaudeService {
  async generateCharacterProfile(inputs: {
    name: string;
    niche: string;
    targetAudience: string;
    style?: string;
    inspirations?: string[];
  }): Promise<GeneratedProfile> {
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    logger.info('Claude character profile generated', { name: inputs.name });

    try {
      return JSON.parse(text) as GeneratedProfile;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedProfile;
      }
      throw new Error('Failed to parse character profile from Claude response');
    }
  }

  async generateContentCalendar(character: {
    name: string;
    niche: string;
    targetAudience: string;
    personality: string;
    speakingStyle: string;
    coreBelief: string;
  }, month: string, postsPerDay: number): Promise<GeneratedCalendar> {
    const systemPrompt = `You are a viral content strategist specializing in short-form video content. You create monthly content calendars that maximize engagement through strategic topic sequencing, emotional hooks, and trend awareness.

Always respond with valid JSON matching the exact schema requested. Do not include markdown formatting or code blocks.`;

    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

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

Generate ${daysInMonth * postsPerDay} slots total. Vary topics, emotional triggers, and hooks. Include a mix of educational, entertaining, and inspirational content. Optimize posting times for maximum reach.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    logger.info('Claude calendar generated', { month, character: character.name });

    try {
      return JSON.parse(text) as GeneratedCalendar;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedCalendar;
      }
      throw new Error('Failed to parse calendar from Claude response');
    }
  }

  async generateScript(character: {
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
}

The script should:
1. Start with an irresistible hook
2. Deliver genuine value or entertainment
3. Use the character's natural speaking style
4. End with a clear CTA
5. Be conversational, not scripted-sounding`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    logger.info('Claude script generated', { topic: slot.topic });

    try {
      return JSON.parse(text) as GeneratedScript;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedScript;
      }
      throw new Error('Failed to parse script from Claude response');
    }
  }

  async rewriteViralScript(character: {
    name: string;
    personality: string;
    speakingStyle: string;
    coreBelief: string;
    niche: string;
    antiKeywords: string[];
  }, originalScript: string, sourceReference?: string): Promise<GeneratedScript> {
    const systemPrompt = `You are a viral content adapter. You take existing viral scripts and rewrite them in a specific character's voice while maintaining the viral structure. The result must feel original and authentic to the character.

Always respond with valid JSON matching the exact schema requested. Do not include markdown formatting or code blocks.`;

    const userPrompt = `Rewrite this viral script in ${character.name}'s voice:

Original Script:
${originalScript}
${sourceReference ? `Source: ${sourceReference}` : ''}

Character Voice:
Personality: ${character.personality}
Speaking Style: ${character.speakingStyle}
Core Belief: ${character.coreBelief}
Niche: ${character.niche}
NEVER use these words: ${character.antiKeywords.join(', ')}

Return a JSON object:
{
  "title": "new title",
  "hook": "rewritten hook",
  "body": "rewritten body",
  "cta": "rewritten cta",
  "fullScript": "complete rewritten script",
  "emotionalTrigger": "primary emotional trigger",
  "estimatedDurationSeconds": number,
  "wordCount": number
}

Keep the viral structure but make it 100% ${character.name}'s voice.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    logger.info('Claude viral rewrite generated');

    try {
      return JSON.parse(text) as GeneratedScript;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeneratedScript;
      }
      throw new Error('Failed to parse rewritten script from Claude response');
    }
  }
}

export const claudeService = new ClaudeService();
