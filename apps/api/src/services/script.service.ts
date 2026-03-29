import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { estimateDuration } from '../utils/script-splitter';


export class ScriptService {
  async create(userId: string, data: {
    characterId: string;
    title: string;
    fullScript: string;
    hook?: string;
    body?: string;
    cta?: string;
    emotionalTrigger?: string;
    targetPlatform?: any;
    generationMethod?: any;
    sourceReference?: string;
    claudePrompt?: string;
  }) {
    const character = await prisma.character.findUnique({ where: { id: data.characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    const wordCount = data.fullScript.split(/\s+/).length;
    const estimatedDuration = estimateDuration(data.fullScript);

    return prisma.script.create({
      data: {
        characterId: data.characterId,
        title: data.title,
        fullScript: data.fullScript,
        hook: data.hook,
        body: data.body,
        cta: data.cta,
        emotionalTrigger: data.emotionalTrigger,
        targetPlatform: data.targetPlatform || 'TIKTOK',
        wordCount,
        estimatedDurationSeconds: estimatedDuration,
        generationMethod: data.generationMethod || 'AI_GENERATED',
        sourceReference: data.sourceReference,
        claudePrompt: data.claudePrompt,
      },
    });
  }

  async list(userId: string, characterId: string, page: number = 1, limit: number = 20) {
    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character) throw new NotFoundError('Character not found');
    if (character.userId !== userId) throw new ForbiddenError('Not your character');

    const skip = (page - 1) * limit;
    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where: { characterId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.script.count({ where: { characterId } }),
    ]);

    return { scripts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(userId: string, scriptId: string) {
    const script = await prisma.script.findUnique({
      where: { id: scriptId },
      include: { character: true, contentSlot: true },
    });
    if (!script) throw new NotFoundError('Script not found');
    if (script.character.userId !== userId) throw new ForbiddenError('Not your script');
    return script;
  }

  async update(userId: string, scriptId: string, data: Record<string, any>) {
    const script = await this.getById(userId, scriptId);

    if (data.fullScript) {
      data.wordCount = data.fullScript.split(/\s+/).length;
      data.estimatedDurationSeconds = estimateDuration(data.fullScript);
    }

    if (data.status === 'APPROVED' || data.status === 'REJECTED') {
      data.reviewedAt = new Date();
    }

    return prisma.script.update({
      where: { id: script.id },
      data,
    });
  }

  async delete(userId: string, scriptId: string) {
    const script = await this.getById(userId, scriptId);
    return prisma.script.delete({ where: { id: script.id } });
  }
}

export const scriptService = new ScriptService();
