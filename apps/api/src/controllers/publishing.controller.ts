import { Response, NextFunction } from 'express';
import { publishingService } from '../services/publishing.service';
import { AuthRequest } from '../types';

export class PublishingController {
  async connectPlatform(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const connection = await publishingService.connectPlatform(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { connection } });
    } catch (error) {
      next(error);
    }
  }

  async listConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const connections = await publishingService.listConnections(req.user!.id);
      res.json({ success: true, data: { connections } });
    } catch (error) {
      next(error);
    }
  }

  async disconnectPlatform(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await publishingService.disconnectPlatform(req.user!.id, req.params.platform as string);
      res.json({ success: true, data: { message: 'Platform disconnected' } });
    } catch (error) {
      next(error);
    }
  }

  async publishSlot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await publishingService.publishSlot(req.user!.id, req.params.slotId as string);
      res.json({ success: true, data: { slot } });
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const characterId = req.query.characterId as string | undefined;
      const queue = await publishingService.getPublishingQueue(req.user!.id, characterId);
      res.json({ success: true, data: { queue } });
    } catch (error) {
      next(error);
    }
  }
}

export const publishingController = new PublishingController();
