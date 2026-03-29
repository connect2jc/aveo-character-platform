import { Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import { studioService } from '../services/studio.service';
import { storageService } from '../services/storage.service';
import { redisConnection } from '../config/redis';
import { AuthRequest } from '../types';
import { BadRequestError } from '../utils/errors';

const renderQueue = new Queue('render-studio', { connection: redisConnection });

export class StudioController {
  async createProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await studioService.createProject(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  async listProjects(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await studioService.listProjects(req.user!.id, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await studioService.getProject(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await studioService.updateProject(req.user!.id, req.params.id as string, req.body);
      res.json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await studioService.deleteProject(req.user!.id, req.params.id as string);
      res.json({ success: true, data: { message: 'Project deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async addTrack(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const track = await studioService.addTrack(req.user!.id, req.params.id as string, req.body);
      res.status(201).json({ success: true, data: { track } });
    } catch (error) {
      next(error);
    }
  }

  async updateTrack(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const track = await studioService.updateTrack(
        req.user!.id,
        req.params.id as string,
        req.params.trackId as string,
        req.body
      );
      res.json({ success: true, data: { track } });
    } catch (error) {
      next(error);
    }
  }

  async deleteTrack(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await studioService.deleteTrack(req.user!.id, req.params.id as string, req.params.trackId as string);
      res.json({ success: true, data: { message: 'Track deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      await studioService.getProject(req.user!.id, req.params.id as string);

      const { url } = await storageService.uploadFile(
        req.file.buffer,
        `studio/${req.params.id}`,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        success: true,
        data: {
          url,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async importVideo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const track = await studioService.importAveoVideo(
        req.user!.id,
        req.params.id as string,
        req.params.videoId as string
      );
      res.status(201).json({ success: true, data: { track } });
    } catch (error) {
      next(error);
    }
  }

  async startRender(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await studioService.getProject(req.user!.id, req.params.id as string);

      if (!project.tracks || project.tracks.length === 0) {
        throw new BadRequestError('Project has no tracks to render');
      }

      await studioService.updateProjectStatus(project.id, 'RENDERING');

      await renderQueue.add('render-studio', {
        projectId: project.id,
        userId: req.user!.id,
      });

      res.json({ success: true, data: { status: 'RENDERING', message: 'Render started' } });
    } catch (error) {
      next(error);
    }
  }

  async getRenderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await studioService.getProject(req.user!.id, req.params.id as string);
      res.json({
        success: true,
        data: {
          status: project.status,
          outputUrl: project.outputUrl,
          thumbnailUrl: project.thumbnailUrl,
          totalDuration: project.totalDuration,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studioController = new StudioController();
