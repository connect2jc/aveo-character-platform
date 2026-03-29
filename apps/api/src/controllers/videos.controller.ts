import { Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import { videoService } from '../services/video.service';
import { scriptService } from '../services/script.service';
import { splitScript } from '../utils/script-splitter';
import { redisConnection } from '../config/redis';
import { AuthRequest } from '../types';

const audioQueue = new Queue('generate-audio', { connection: redisConnection });

export class VideosController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { characterId, scriptId, variationId, aspectRatio } = req.body;

      const script = await scriptService.getById(req.user!.id, scriptId);
      const video = await videoService.create(req.user!.id, {
        characterId,
        scriptId,
        variationId,
        aspectRatio,
      });

      const segments = splitScript(script.fullScript);
      await videoService.createClips(video.id, segments);

      await audioQueue.add('generate-audio', {
        videoId: video.id,
        characterId,
        userId: req.user!.id,
      });

      await videoService.update(req.user!.id, video.id, { status: 'GENERATING_AUDIO' });

      const fullVideo = await videoService.getById(req.user!.id, video.id);
      res.status(201).json({ success: true, data: { video: fullVideo } });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const characterId = req.query.characterId as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await videoService.list(req.user!.id, characterId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const video = await videoService.getById(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { video } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const video = await videoService.update(req.user!.id, req.params.id as string, req.body);
      res.json({ success: true, data: { video } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await videoService.delete(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { message: 'Video deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async retry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const video = await videoService.getById(req.user!.id, req.params.id as string);

      await videoService.update(req.user!.id, video.id, { status: 'GENERATING_AUDIO' });

      await audioQueue.add('generate-audio', {
        videoId: video.id,
        characterId: video.characterId,
        userId: req.user!.id,
      });

      res.json({ success: true, data: { message: 'Video generation restarted' } });
    } catch (error) {
      next(error);
    }
  }
}

export const videosController = new VideosController();
