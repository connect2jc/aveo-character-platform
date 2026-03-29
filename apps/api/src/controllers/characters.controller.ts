import { Response, NextFunction } from 'express';
import { characterService } from '../services/character.service';
import { claudeService } from '../services/ai/claude.service';
import { falService } from '../services/ai/fal.service';
import { elevenLabsService } from '../services/ai/elevenlabs.service';
import { openaiService } from '../services/ai/openai.service';
import { resolveScriptProvider, resolveImageProvider, resolveVoiceProvider } from '../utils/provider-resolver';
import { AuthRequest } from '../types';

export class CharactersController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const character = await characterService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { character } });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await characterService.list(req.user!.id, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const character = await characterService.getById(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { character } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const character = await characterService.update(req.user!.id, req.params.id as string, req.body);
      res.json({ success: true, data: { character } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await characterService.delete(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { message: 'Character deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async generateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, apiKey } = await resolveScriptProvider(req.user!.id);

      let profile;
      if (provider === 'openai') {
        profile = await openaiService.generateCharacterProfile(apiKey, req.body);
      } else {
        profile = await claudeService.generateCharacterProfile(req.body, apiKey);
      }

      if (req.params.id) {
        await characterService.update(req.user!.id, req.params.id as string, {
          age: profile.age,
          originBackstory: profile.originBackstory,
          coreBelief: profile.coreBelief,
          personality: profile.personality,
          speakingStyle: profile.speakingStyle,
          niche: profile.niche,
          targetAudience: profile.targetAudience,
          imagePrompt: profile.imagePrompt,
          voicePrompt: profile.voicePrompt,
          antiKeywords: profile.antiKeywords,
        });
      }

      res.json({ success: true, data: { profile } });
    } catch (error) {
      next(error);
    }
  }

  async generateImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt, style } = req.body;
      const fullPrompt = style ? `${prompt}, ${style} style` : prompt;

      const { provider, apiKey } = await resolveImageProvider(req.user!.id);

      let result;
      if (provider === 'openai') {
        result = await openaiService.generateCharacterImage(apiKey, fullPrompt, 4);
      } else {
        result = await falService.generateCharacterImage(fullPrompt, 4, apiKey);
      }

      res.json({ success: true, data: { images: result.images } });
    } catch (error) {
      next(error);
    }
  }

  async selectImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl } = req.body;
      const character = await characterService.selectImage(req.user!.id, req.params.id as string, imageUrl);
      res.json({ success: true, data: { character } });
    } catch (error) {
      next(error);
    }
  }

  async generateVariations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const character = await characterService.getById(req.user!.id, req.params.id as string);
      if (!character.baseImageUrl) {
        res.status(400).json({ success: false, error: { message: 'Character has no base image', statusCode: 400 } });
        return;
      }

      const count = req.body.count || 3;
      const variationTypes = req.body.types || ['EXPRESSION', 'OUTFIT', 'BACKGROUND'];
      const variations: { variationType: string; imageUrl: string; imagePrompt: string; description: string }[] = [];

      for (let i = 0; i < Math.min(count, variationTypes.length); i++) {
        const type = variationTypes[i];
        const prompts: Record<string, string> = {
          EXPRESSION: `Same person, different facial expression, warm smile, natural lighting`,
          OUTFIT: `Same person, different professional outfit, modern style`,
          BACKGROUND: `Same person, different background setting, urban environment`,
          ANGLE: `Same person, slightly different camera angle, dynamic pose`,
          STYLE: `Same person, slightly different artistic style, vibrant colors`,
        };

        const variationPrompt = prompts[type] || prompts.EXPRESSION;
        const result = await falService.generateVariation(character.baseImageUrl, variationPrompt);

        variations.push({
          variationType: type,
          imageUrl: result.url,
          imagePrompt: variationPrompt,
          description: `${type.toLowerCase()} variation`,
        });
      }

      await characterService.saveVariations(character.id, variations);

      res.json({ success: true, data: { variations } });
    } catch (error) {
      next(error);
    }
  }

  async generateVoice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt } = req.body;
      const { provider, apiKey } = await resolveVoiceProvider(req.user!.id);

      if (provider === 'openai') {
        // OpenAI doesn't support voice design, return a default voice
        res.json({ success: true, data: { voice: { voiceId: 'nova', previewUrl: '', name: 'OpenAI Nova' } } });
        return;
      }

      const result = await elevenLabsService.designVoice(prompt, apiKey);
      res.json({ success: true, data: { voice: result } });
    } catch (error) {
      next(error);
    }
  }

  async testVoice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { voiceId, text } = req.body;
      const { provider, apiKey } = await resolveVoiceProvider(req.user!.id);

      let audioBuffer: Buffer;
      if (provider === 'openai') {
        audioBuffer = await openaiService.textToSpeech(apiKey, text, voiceId || 'nova');
      } else {
        audioBuffer = await elevenLabsService.textToSpeech(voiceId, text, undefined, apiKey);
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      res.send(audioBuffer);
    } catch (error) {
      next(error);
    }
  }

  async selectVoice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { voiceId, voiceSettings } = req.body;
      const character = await characterService.selectVoice(req.user!.id, req.params.id as string, voiceId, voiceSettings);
      res.json({ success: true, data: { character } });
    } catch (error) {
      next(error);
    }
  }
}

export const charactersController = new CharactersController();
