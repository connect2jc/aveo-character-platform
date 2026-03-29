import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';


export class PublishingService {
  async connectPlatform(userId: string, data: {
    platform: any;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    accountName?: string;
    accountId?: string;
  }) {
    return prisma.platformConnection.upsert({
      where: { userId_platform: { userId, platform: data.platform } },
      create: { userId, ...data },
      update: data,
    });
  }

  async listConnections(userId: string) {
    return prisma.platformConnection.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountId: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async disconnectPlatform(userId: string, platform: string) {
    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId, platform: platform as any } },
    });
    if (!connection) throw new NotFoundError('Platform connection not found');

    return prisma.platformConnection.delete({ where: { id: connection.id } });
  }

  async publishSlot(userId: string, slotId: string) {
    const slot = await prisma.contentSlot.findUnique({
      where: { id: slotId },
      include: { character: true, video: true },
    });

    if (!slot) throw new NotFoundError('Content slot not found');
    if (slot.character.userId !== userId) throw new ForbiddenError('Not your content');
    if (!slot.videoId) throw new BadRequestError('No video attached to this slot');
    if (slot.publishStatus === 'PUBLISHED') throw new BadRequestError('Already published');

    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId, platform: slot.platform } },
    });

    if (!connection) throw new BadRequestError(`No ${slot.platform} connection found. Connect your account first.`);

    // Platform-specific publishing would go here
    // For now, mark as published
    return prisma.contentSlot.update({
      where: { id: slotId },
      data: {
        publishStatus: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async getPublishingQueue(userId: string, characterId?: string) {
    const where: any = {
      character: { userId },
      publishStatus: { in: ['VIDEO_READY', 'SCHEDULED'] },
      videoId: { not: null },
    };
    if (characterId) where.characterId = characterId;

    return prisma.contentSlot.findMany({
      where,
      include: {
        character: { select: { name: true } },
        video: { select: { finalVideoUrl: true, status: true } },
        script: { select: { title: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}

export const publishingService = new PublishingService();
