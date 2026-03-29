import { Worker, Job } from 'bullmq';
import { prisma } from '../config/database';
import { redisConnection } from '../config/redis';
import { storageService } from '../services/storage.service';
import { stitchClips, generateThumbnail, getVideoDuration } from '../utils/ffmpeg';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';


interface StitchJobData {
  videoId: string;
}

export const stitchWorker = new Worker<StitchJobData>(
  'stitch-video',
  async (job: Job<StitchJobData>) => {
    const { videoId } = job.data;
    logger.info('Starting video stitching', { videoId });

    const tmpDir = path.join(os.tmpdir(), `aveo_stitch_${videoId}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { clips: { orderBy: { clipIndex: 'asc' } } },
      });

      if (!video) throw new Error('Video not found');

      // Download all clip files
      const clipPaths: string[] = [];
      for (const clip of video.clips) {
        if (!clip.clipUrl) throw new Error(`Clip ${clip.clipIndex} has no URL`);

        const clipPath = path.join(tmpDir, `clip_${clip.clipIndex}.mp4`);
        const response = await axios.get(clip.clipUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(clipPath, Buffer.from(response.data));
        clipPaths.push(clipPath);

        await job.updateProgress((clip.clipIndex / video.clips.length) * 40);
      }

      // Stitch clips together
      const outputPath = path.join(tmpDir, 'final.mp4');
      await stitchClips({
        clipPaths,
        outputPath,
        aspectRatio: video.aspectRatio as '9:16' | '16:9' | '1:1',
        addCaptions: false,
      });

      await job.updateProgress(70);

      // Generate thumbnail
      const thumbnailPath = path.join(tmpDir, 'thumbnail.jpg');
      await generateThumbnail(outputPath, thumbnailPath);

      // Get duration
      const duration = await getVideoDuration(outputPath);

      await job.updateProgress(80);

      // Upload final video to S3
      const videoBuffer = fs.readFileSync(outputPath);
      const { url: finalVideoUrl } = await storageService.uploadFile(
        videoBuffer,
        `videos/${videoId}`,
        'final.mp4',
        'video/mp4'
      );

      // Upload thumbnail
      const thumbBuffer = fs.readFileSync(thumbnailPath);
      const { url: thumbnailUrl } = await storageService.uploadFile(
        thumbBuffer,
        `videos/${videoId}`,
        'thumbnail.jpg',
        'image/jpeg'
      );

      await job.updateProgress(95);

      // Calculate total cost
      const totalCost = (video.heygenCreditsUsed || 0) + (video.elevenlabsCost || 0);

      // Update video record
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'QA_READY',
          finalVideoUrl,
          thumbnailUrl,
          totalDurationSeconds: duration,
          hasCaptions: false,
          totalGenerationCost: totalCost,
        },
      });

      // Update usage tracking
      await prisma.usageTracking.updateMany({
        where: {
          userId: video.userId,
          month: new Date().toISOString().slice(0, 7),
        },
        data: {
          videosGenerated: { increment: 1 },
          totalHeygenCost: { increment: video.heygenCreditsUsed || 0 },
          totalElevenlabsCost: { increment: video.elevenlabsCost || 0 },
        },
      });

      logger.info('Video stitching complete', { videoId, duration, finalVideoUrl });

      await job.updateProgress(100);
    } catch (error: any) {
      logger.error('Video stitching failed', { videoId, error: error.message });

      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });

      throw error;
    } finally {
      // Cleanup temp files
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
  }
);
