import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';


export class CharacterService {
  async create(userId: string, data: { name: string; niche?: string; targetAudience?: string }) {
    return prisma.character.create({
      data: {
        userId,
        name: data.name,
        niche: data.niche,
        targetAudience: data.targetAudience,
      },
    });
  }

  async list(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        where: { userId },
        include: { variations: true, _count: { select: { scripts: true, videos: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.character.count({ where: { userId } }),
    ]);

    return { characters, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(userId: string, characterId: string) {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        variations: true,
        _count: { select: { scripts: true, videos: true, calendars: true } },
      },
    });

    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    return character;
  }

  async update(userId: string, characterId: string, data: Record<string, any>) {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    return prisma.character.update({
      where: { id: characterId },
      data,
    });
  }

  async selectImage(userId: string, characterId: string, imageUrl: string) {
    const character = await this.getById(userId, characterId);
    return prisma.character.update({
      where: { id: character.id },
      data: { baseImageUrl: imageUrl },
    });
  }

  async saveVariations(characterId: string, variations: { variationType: string; imageUrl: string; imagePrompt?: string; description?: string }[]) {
    return prisma.characterVariation.createMany({
      data: variations.map(v => ({
        characterId,
        variationType: v.variationType as any,
        imageUrl: v.imageUrl,
        imagePrompt: v.imagePrompt,
        description: v.description,
      })),
    });
  }

  async selectVoice(userId: string, characterId: string, voiceId: string, voiceSettings?: Record<string, unknown>) {
    const character = await this.getById(userId, characterId);
    return prisma.character.update({
      where: { id: character.id },
      data: {
        elevenlabsVoiceId: voiceId,
        voiceSettings: (voiceSettings as any) || undefined,
      },
    });
  }

  async delete(userId: string, characterId: string) {
    const character = await this.getById(userId, characterId);
    return prisma.character.delete({ where: { id: character.id } });
  }
}

export const characterService = new CharacterService();
