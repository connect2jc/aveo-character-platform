import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class StudioService {
  async createProject(userId: string, data: { title: string; aspectRatio?: string }) {
    return prisma.studioProject.create({
      data: {
        userId,
        title: data.title,
        aspectRatio: data.aspectRatio || '9:16',
      },
      include: { tracks: true },
    });
  }

  async listProjects(userId: string, page: number = 1, limit: number = 20) {
    const [projects, total] = await Promise.all([
      prisma.studioProject.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { tracks: { orderBy: { trackIndex: 'asc' } } },
      }),
      prisma.studioProject.count({ where: { userId } }),
    ]);

    return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getProject(userId: string, projectId: string) {
    const project = await prisma.studioProject.findUnique({
      where: { id: projectId },
      include: { tracks: { orderBy: [{ trackIndex: 'asc' }, { startTime: 'asc' }] } },
    });

    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== userId) throw new ForbiddenError();
    return project;
  }

  async updateProject(userId: string, projectId: string, data: { title?: string; aspectRatio?: string }) {
    const project = await this.getProject(userId, projectId);
    return prisma.studioProject.update({
      where: { id: project.id },
      data,
      include: { tracks: true },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.getProject(userId, projectId);
    await prisma.studioProject.delete({ where: { id: project.id } });
  }

  async addTrack(userId: string, projectId: string, data: {
    type: string;
    sourceUrl: string;
    fileName?: string;
    startTime?: number;
    duration?: number;
    trimStart?: number;
    trimEnd?: number;
    volume?: number;
    trackIndex?: number;
  }) {
    await this.getProject(userId, projectId);

    return prisma.studioTrack.create({
      data: {
        projectId,
        type: data.type,
        sourceUrl: data.sourceUrl,
        fileName: data.fileName,
        startTime: data.startTime ?? 0,
        duration: data.duration,
        trimStart: data.trimStart ?? 0,
        trimEnd: data.trimEnd,
        volume: data.volume ?? 1.0,
        trackIndex: data.trackIndex ?? 0,
      },
    });
  }

  async updateTrack(userId: string, projectId: string, trackId: string, data: {
    startTime?: number;
    duration?: number;
    trimStart?: number;
    trimEnd?: number;
    volume?: number;
    trackIndex?: number;
  }) {
    await this.getProject(userId, projectId);

    const track = await prisma.studioTrack.findUnique({ where: { id: trackId } });
    if (!track || track.projectId !== projectId) throw new NotFoundError('Track not found');

    return prisma.studioTrack.update({
      where: { id: trackId },
      data,
    });
  }

  async deleteTrack(userId: string, projectId: string, trackId: string) {
    await this.getProject(userId, projectId);

    const track = await prisma.studioTrack.findUnique({ where: { id: trackId } });
    if (!track || track.projectId !== projectId) throw new NotFoundError('Track not found');

    await prisma.studioTrack.delete({ where: { id: trackId } });
  }

  async importAveoVideo(userId: string, projectId: string, videoId: string) {
    await this.getProject(userId, projectId);

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video || video.userId !== userId) throw new NotFoundError('Video not found');
    if (!video.finalVideoUrl) throw new NotFoundError('Video has no output file');

    return prisma.studioTrack.create({
      data: {
        projectId,
        type: 'video',
        sourceUrl: video.finalVideoUrl,
        fileName: `aveo_video_${video.id}.mp4`,
        duration: video.totalDurationSeconds ? Number(video.totalDurationSeconds) : undefined,
        trackIndex: 0,
      },
    });
  }

  async updateProjectStatus(projectId: string, status: string, outputUrl?: string, thumbnailUrl?: string, totalDuration?: number) {
    return prisma.studioProject.update({
      where: { id: projectId },
      data: {
        status,
        ...(outputUrl && { outputUrl }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(totalDuration !== undefined && { totalDuration }),
      },
    });
  }
}

export const studioService = new StudioService();
