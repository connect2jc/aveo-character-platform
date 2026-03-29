import { Worker, Job, Queue } from 'bullmq';
import { prisma } from '../config/database';
import { redisConnection } from '../config/redis';
import { heygenService } from '../services/ai/heygen.service';
import { logger } from '../utils/logger';

const stitchQueue = new Queue('stitch-video', { connection: redisConnection });

interface ClipsJobData {
  videoId: string;
  characterId: string;
  userId: string;
}

export const clipsWorker = new Worker<ClipsJobData>(
  'generate-clips',
  async (job: Job<ClipsJobData>) => {
    const { videoId, characterId } = job.data;
    logger.info('Starting clip generation', { videoId });

    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        include: { variations: true },
      });

      if (!character || !character.baseImageUrl) {
        throw new Error('Character or base image not found');
      }

      const clips = await prisma.videoClip.findMany({
        where: { videoId, status: 'PROCESSING' },
        orderBy: { clipIndex: 'asc' },
      });

      const variations = character.variations;
      let totalCredits = 0;

      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];

        if (!clip.audioUrl) {
          throw new Error(`Clip ${clip.clipIndex} has no audio URL`);
        }

        // Rotate through base image and variations
        let imageUrl = character.baseImageUrl;
        if (variations.length > 0 && i > 0) {
          const variationIndex = (i - 1) % variations.length;
          imageUrl = variations[variationIndex].imageUrl;
        }

        const { jobId } = await heygenService.createPhotoToVideo(
          imageUrl,
          clip.audioUrl
        );

        await prisma.videoClip.update({
          where: { id: clip.id },
          data: { heygenJobId: jobId },
        });

        totalCredits += 1;
        await job.updateProgress(((i + 1) / clips.length) * 50);
      }

      // Poll for completion
      let allCompleted = false;
      let attempts = 0;
      const maxAttempts = 120;

      while (!allCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;

        const updatedClips = await prisma.videoClip.findMany({
          where: { videoId },
          orderBy: { clipIndex: 'asc' },
        });

        let completedCount = 0;
        for (const clip of updatedClips) {
          if (clip.status === 'COMPLETED') {
            completedCount++;
            continue;
          }

          if (clip.status === 'FAILED') {
            if (clip.retryCount < 3) {
              const { jobId: newJobId } = await heygenService.createPhotoToVideo(
                character.baseImageUrl,
                clip.audioUrl!
              );
              await prisma.videoClip.update({
                where: { id: clip.id },
                data: {
                  heygenJobId: newJobId,
                  status: 'PROCESSING',
                  retryCount: clip.retryCount + 1,
                },
              });
              totalCredits += 1;
            }
            continue;
          }

          if (clip.heygenJobId) {
            const status = await heygenService.getVideoStatus(clip.heygenJobId);

            if (status.status === 'completed' && status.videoUrl) {
              await prisma.videoClip.update({
                where: { id: clip.id },
                data: {
                  status: 'COMPLETED',
                  clipUrl: status.videoUrl,
                  durationSeconds: status.duration,
                },
              });
              completedCount++;
            } else if (status.status === 'failed') {
              await prisma.videoClip.update({
                where: { id: clip.id },
                data: {
                  status: 'FAILED',
                  errorMessage: status.error,
                },
              });
            }
          }
        }

        allCompleted = completedCount === updatedClips.length;
        await job.updateProgress(50 + (completedCount / updatedClips.length) * 50);
      }

      if (!allCompleted) {
        throw new Error('Clip generation timed out');
      }

      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'STITCHING',
          heygenCreditsUsed: totalCredits,
        },
      });

      await stitchQueue.add('stitch-video', { videoId });

      logger.info('Clip generation complete', { videoId, totalCredits });
    } catch (error: any) {
      logger.error('Clip generation failed', { videoId, error: error.message });

      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    limiter: { max: 3, duration: 60000 },
  }
);
