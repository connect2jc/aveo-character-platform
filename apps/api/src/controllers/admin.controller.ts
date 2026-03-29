import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export class AdminController {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            role: true,
            status: true,
            onboardingCompleted: true,
            createdAt: true,
            _count: { select: { characters: true, videos: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count(),
      ]);

      res.json({ success: true, data: { users, total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id as string },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          status: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          onboardingCompleted: true,
          createdAt: true,
          characters: { select: { id: true, name: true, status: true } },
          usageTracking: { orderBy: { month: 'desc' }, take: 3 },
        },
      });

      if (!user) throw new NotFoundError('User not found');
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plan, status, role } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id as string },
        data: {
          ...(plan && { plan }),
          ...(status && { status }),
          ...(role && { role }),
        },
      });

      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalUsers, totalCharacters, totalVideos, totalScripts] = await Promise.all([
        prisma.user.count(),
        prisma.character.count(),
        prisma.video.count(),
        prisma.script.count(),
      ]);

      const month = new Date().toISOString().slice(0, 7);
      const usageAgg = await prisma.usageTracking.aggregate({
        where: { month },
        _sum: {
          videosGenerated: true,
          scriptsGenerated: true,
          totalHeygenCost: true,
          totalElevenlabsCost: true,
          totalFalCost: true,
          totalClaudeCost: true,
        },
      });

      const recentUsers = await prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCharacters,
          totalVideos,
          totalScripts,
          recentUsers,
          monthlyUsage: usageAgg._sum,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const status = req.query.status as string | undefined;

      const where: any = {};
      if (status) where.status = status;

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            character: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.video.count({ where }),
      ]);

      res.json({ success: true, data: { videos, total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
