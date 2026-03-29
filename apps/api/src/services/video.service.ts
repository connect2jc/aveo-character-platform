import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';


export class VideoService {
  async create(userId: string, data: {
    characterId: string;
    scriptId: string;
    variationId?: string;
    aspectRatio?: string;
  }) {
    const character = await prisma.character.findUnique({ where: { id: data.characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    const script = await prisma.script.findUnique({ where: { id: data.scriptId } });
    if (!script) throw new NotFoundError('Script not found');

    const resolutionMap: Record<string, string> = {
      '9:16': '1080x1920',
      '16:9': '1920x1080',
      '1:1': '1080x1080',
    };

    return prisma.video.create({
      data: {
        characterId: data.characterId,
        scriptId: data.scriptId,
        userId,
        variationId: data.variationId,
        aspectRatio: data.aspectRatio || '9:16',
        resolution: resolutionMap[data.aspectRatio || '9:16'] || '1080x1920',
      },
    });
  }

  async list(userId: string, characterId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (characterId) where.characterId = characterId;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          character: { select: { name: true, baseImageUrl: true } },
          script: { select: { title: true } },
          _count: { select: { clips: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    return { videos, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(userId: string, videoId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        character: true,
        script: true,
        variation: true,
        clips: { orderBy: { clipIndex: 'asc' } },
      },
    });
    if (!video) throw new NotFoundError('Video not found');
    if (video.userId !== userId) throw new ForbiddenError('Not your video');
    return video;
  }

  async update(userId: string, videoId: string, data: Record<string, any>) {
    const video = await this.getById(userId, videoId);
    return prisma.video.update({ where: { id: video.id }, data });
  }

  async updateClip(clipId: string, data: Record<string, any>) {
    return prisma.videoClip.update({ where: { id: clipId }, data });
  }

  async createClips(videoId: string, segments: { index: number; text: string; estimatedDuration: number }[]) {
    await prisma.videoClip.createMany({
      data: segments.map(seg => ({
        videoId,
        clipIndex: seg.index,
        scriptSegment: seg.text,
        durationSeconds: seg.estimatedDuration,
      })),
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { clipCount: segments.length },
    });
  }

  async delete(userId: string, videoId: string) {
    const video = await this.getById(userId, videoId);
    return prisma.video.delete({ where: { id: video.id } });
  }
}

export const videoService = new VideoService();
