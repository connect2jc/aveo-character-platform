import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { scriptService } from '../services/script.service';
import { characterService } from '../services/character.service';
import { claudeService } from '../services/ai/claude.service';
import { AuthRequest } from '../types';

export class ScriptsController {
  async generate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { characterId, topic, hook, emotionalTrigger, cta, targetPlatform, slotId } = req.body;
      const character = await characterService.getById(req.user!.id, characterId);

      const generatedScript = await claudeService.generateScript(
        {
          name: character.name,
          personality: character.personality || '',
          speakingStyle: character.speakingStyle || '',
          coreBelief: character.coreBelief || '',
          niche: character.niche || '',
          antiKeywords: character.antiKeywords || [],
        },
        { topic, hook, emotionalTrigger, cta, platform: targetPlatform }
      );

      const script = await scriptService.create(req.user!.id, {
        characterId,
        title: generatedScript.title,
        fullScript: generatedScript.fullScript,
        hook: generatedScript.hook,
        body: generatedScript.body,
        cta: generatedScript.cta,
        emotionalTrigger: generatedScript.emotionalTrigger,
        targetPlatform: targetPlatform || 'TIKTOK',
        generationMethod: 'AI_GENERATED',
      });

      if (slotId) {
        await prisma.contentSlot.update({
          where: { id: slotId },
          data: { scriptId: script.id, publishStatus: 'SCRIPT_READY' },
        });
      }

      res.status(201).json({ success: true, data: { script } });
    } catch (error) {
      next(error);
    }
  }

  async rewrite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { characterId, originalScript, sourceReference } = req.body;
      const character = await characterService.getById(req.user!.id, characterId);

      const rewritten = await claudeService.rewriteViralScript(
        {
          name: character.name,
          personality: character.personality || '',
          speakingStyle: character.speakingStyle || '',
          coreBelief: character.coreBelief || '',
          niche: character.niche || '',
          antiKeywords: character.antiKeywords || [],
        },
        originalScript,
        sourceReference
      );

      const script = await scriptService.create(req.user!.id, {
        characterId,
        title: rewritten.title,
        fullScript: rewritten.fullScript,
        hook: rewritten.hook,
        body: rewritten.body,
        cta: rewritten.cta,
        emotionalTrigger: rewritten.emotionalTrigger,
        generationMethod: 'VIRAL_REWRITE',
        sourceReference,
      });

      res.status(201).json({ success: true, data: { script } });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const characterId = req.params.characterId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await scriptService.list(req.user!.id, characterId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const script = await scriptService.getById(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { script } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const script = await scriptService.update(req.user!.id, req.params.id as string, req.body);
      res.json({ success: true, data: { script } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await scriptService.delete(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { message: 'Script deleted' } });
    } catch (error) {
      next(error);
    }
  }
}

export const scriptsController = new ScriptsController();
