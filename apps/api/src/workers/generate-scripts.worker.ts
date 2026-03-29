import { Worker, Job } from 'bullmq';
import { prisma } from '../config/database';
import { redisConnection } from '../config/redis';
import { claudeService } from '../services/ai/claude.service';
import { estimateDuration } from '../utils/script-splitter';
import { logger } from '../utils/logger';


interface ScriptsJobData {
  calendarId: string;
  characterId: string;
  userId: string;
  slotIds?: string[];
}

export const scriptsWorker = new Worker<ScriptsJobData>(
  'generate-scripts',
  async (job: Job<ScriptsJobData>) => {
    const { calendarId, characterId, userId, slotIds } = job.data;
    logger.info('Starting batch script generation', { calendarId, characterId });

    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      if (!character) throw new Error('Character not found');

      const where: any = { calendarId, scriptId: null };
      if (slotIds?.length) {
        where.id = { in: slotIds };
      }

      const slots = await prisma.contentSlot.findMany({
        where,
        orderBy: [{ scheduledDate: 'asc' }, { slotNumber: 'asc' }],
      });

      let generated = 0;

      for (const slot of slots) {
        try {
          const generatedScript = await claudeService.generateScript(
            {
              name: character.name,
              personality: character.personality || '',
              speakingStyle: character.speakingStyle || '',
              coreBelief: character.coreBelief || '',
              niche: character.niche || '',
              antiKeywords: character.antiKeywords || [],
            },
            {
              topic: slot.topic || 'general content',
              hook: slot.hook || undefined,
              emotionalTrigger: slot.emotionalTrigger || undefined,
              cta: slot.cta || undefined,
              platform: slot.platform,
            }
          );

          const script = await prisma.script.create({
            data: {
              characterId,
              title: generatedScript.title,
              fullScript: generatedScript.fullScript,
              hook: generatedScript.hook,
              body: generatedScript.body,
              cta: generatedScript.cta,
              emotionalTrigger: generatedScript.emotionalTrigger,
              targetPlatform: slot.platform,
              wordCount: generatedScript.wordCount,
              estimatedDurationSeconds: generatedScript.estimatedDurationSeconds,
              generationMethod: 'AI_GENERATED',
            },
          });

          await prisma.contentSlot.update({
            where: { id: slot.id },
            data: {
              scriptId: script.id,
              publishStatus: 'SCRIPT_READY',
            },
          });

          generated++;
          await job.updateProgress((generated / slots.length) * 100);

          // Rate limit: small delay between Claude calls
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          logger.error('Failed to generate script for slot', {
            slotId: slot.id,
            error: error.message,
          });
        }
      }

      // Update usage tracking
      await prisma.usageTracking.updateMany({
        where: {
          userId,
          month: new Date().toISOString().slice(0, 7),
        },
        data: {
          scriptsGenerated: { increment: generated },
        },
      });

      logger.info('Batch script generation complete', { calendarId, generated, total: slots.length });
    } catch (error: any) {
      logger.error('Batch script generation failed', { calendarId, error: error.message });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    limiter: { max: 2, duration: 60000 },
  }
);
