import { Worker, Job, Queue } from 'bullmq';
import { prisma } from '../config/database';
import { redisConnection } from '../config/redis';
import { elevenLabsService } from '../services/ai/elevenlabs.service';
import { openaiService } from '../services/ai/openai.service';
import { resolveVoiceProvider } from '../utils/provider-resolver';
import { storageService } from '../services/storage.service';
import { logger } from '../utils/logger';

const clipsQueue = new Queue('generate-clips', { connection: redisConnection });

interface AudioJobData {
  videoId: string;
  characterId: string;
  userId: string;
}

export const audioWorker = new Worker<AudioJobData>(
  'generate-audio',
  async (job: Job<AudioJobData>) => {
    const { videoId, characterId } = job.data;
    logger.info('Starting audio generation', { videoId });

    try {
      const character = await prisma.character.findUnique({ where: { id: characterId } });
      if (!character) {
        throw new Error('Character not found');
      }

      const { provider: voiceProvider, apiKey: voiceApiKey } = await resolveVoiceProvider(job.data.userId);

      if (voiceProvider === 'elevenlabs' && !character.elevenlabsVoiceId) {
        throw new Error('Character has no ElevenLabs voice ID');
      }

      const clips = await prisma.videoClip.findMany({
        where: { videoId },
        orderBy: { clipIndex: 'asc' },
      });

      let totalCost = 0;

      for (const clip of clips) {
        await job.updateProgress((clip.clipIndex / clips.length) * 100);

        let audioBuffer: Buffer;
        if (voiceProvider === 'openai') {
          audioBuffer = await openaiService.textToSpeech(voiceApiKey, clip.scriptSegment, character.elevenlabsVoiceId || 'nova');
        } else {
          audioBuffer = await elevenLabsService.textToSpeech(
            character.elevenlabsVoiceId!,
            clip.scriptSegment,
            character.voiceSettings as any,
            voiceApiKey
          );
        }

        const { url } = await storageService.uploadFile(
          audioBuffer,
          `audio/${videoId}`,
          `clip_${clip.clipIndex}.mp3`,
          'audio/mpeg'
        );

        const charCount = clip.scriptSegment.length;
        const clipCost = (charCount / 1000) * 0.30;
        totalCost += clipCost;

        await prisma.videoClip.update({
          where: { id: clip.id },
          data: {
            audioUrl: url,
            status: 'PROCESSING',
          },
        });
      }

      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'GENERATING_CLIPS',
          elevenlabsCost: totalCost,
        },
      });

      // Queue clip generation
      await clipsQueue.add('generate-clips', {
        videoId,
        characterId,
        userId: job.data.userId,
      });

      logger.info('Audio generation complete', { videoId, totalCost });
    } catch (error: any) {
      logger.error('Audio generation failed', { videoId, error: error.message });

      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: { max: 5, duration: 60000 },
  }
);
