import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class ContentSlotsController {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const calendarId = req.params.calendarId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const calendar = await prisma.contentCalendar.findUnique({
        where: { id: calendarId },
        include: { character: true },
      });
      if (!calendar) throw new NotFoundError('Calendar not found');
      if (calendar.character.userId !== req.user!.id) throw new ForbiddenError('Not your calendar');

      const [slots, total] = await Promise.all([
        prisma.contentSlot.findMany({
          where: { calendarId },
          include: { script: true, video: { select: { id: true, status: true, finalVideoUrl: true } } },
          orderBy: [{ scheduledDate: 'asc' }, { slotNumber: 'asc' }],
          skip,
          take: limit,
        }),
        prisma.contentSlot.count({ where: { calendarId } }),
      ]);

      res.json({ success: true, data: { slots, total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await prisma.contentSlot.findUnique({
        where: { id: req.params.id as string },
        include: { character: true, script: true, video: true, calendar: true },
      });
      if (!slot) throw new NotFoundError('Content slot not found');
      if (slot.character.userId !== req.user!.id) throw new ForbiddenError('Not your content');

      res.json({ success: true, data: { slot } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await prisma.contentSlot.findUnique({
        where: { id: req.params.id as string },
        include: { character: true },
      });
      if (!slot) throw new NotFoundError('Content slot not found');
      if (slot.character.userId !== req.user!.id) throw new ForbiddenError('Not your content');

      const updated = await prisma.contentSlot.update({
        where: { id: req.params.id as string },
        data: req.body,
      });

      res.json({ success: true, data: { slot: updated } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slot = await prisma.contentSlot.findUnique({
        where: { id: req.params.id as string },
        include: { character: true },
      });
      if (!slot) throw new NotFoundError('Content slot not found');
      if (slot.character.userId !== req.user!.id) throw new ForbiddenError('Not your content');

      await prisma.contentSlot.delete({ where: { id: req.params.id as string } });

      res.json({ success: true, data: { message: 'Slot deleted' } });
    } catch (error) {
      next(error);
    }
  }

  async assignScript(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scriptId } = req.body;
      const slot = await prisma.contentSlot.findUnique({
        where: { id: req.params.id as string },
        include: { character: true },
      });
      if (!slot) throw new NotFoundError('Content slot not found');
      if (slot.character.userId !== req.user!.id) throw new ForbiddenError('Not your content');

      const script = await prisma.script.findUnique({ where: { id: scriptId } });
      if (!script) throw new NotFoundError('Script not found');

      const updated = await prisma.contentSlot.update({
        where: { id: req.params.id as string },
        data: { scriptId, publishStatus: 'SCRIPT_READY' },
      });

      res.json({ success: true, data: { slot: updated } });
    } catch (error) {
      next(error);
    }
  }

  async assignVideo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { videoId } = req.body;
      const slot = await prisma.contentSlot.findUnique({
        where: { id: req.params.id as string },
        include: { character: true },
      });
      if (!slot) throw new NotFoundError('Content slot not found');
      if (slot.character.userId !== req.user!.id) throw new ForbiddenError('Not your content');

      const updated = await prisma.contentSlot.update({
        where: { id: req.params.id as string },
        data: { videoId, publishStatus: 'VIDEO_READY' },
      });

      res.json({ success: true, data: { slot: updated } });
    } catch (error) {
      next(error);
    }
  }
}

export const contentSlotsController = new ContentSlotsController();
