import { Worker, Job } from 'bullmq';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { prisma } from '../config/database';
import { redisConnection } from '../config/redis';
import { storageService } from '../services/storage.service';
import { generateThumbnail, getVideoDuration } from '../utils/ffmpeg';
import { logger } from '../utils/logger';

const execFileAsync = promisify(execFile);

interface RenderJobData {
  projectId: string;
  userId: string;
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 });
  fs.writeFileSync(dest, Buffer.from(response.data));
}

export const renderWorker = new Worker<RenderJobData>(
  'render-studio',
  async (job: Job<RenderJobData>) => {
    const { projectId } = job.data;
    logger.info('Starting studio render', { projectId });

    const tmpDir = `/tmp/aveo_studio_${projectId}`;

    try {
      const project = await prisma.studioProject.findUnique({
        where: { id: projectId },
        include: { tracks: { orderBy: [{ trackIndex: 'asc' }, { startTime: 'asc' }] } },
      });

      if (!project || !project.tracks.length) {
        throw new Error('Project or tracks not found');
      }

      // Create temp directory
      fs.mkdirSync(tmpDir, { recursive: true });

      const videoTracks = project.tracks.filter((t) => t.type === 'video');
      const audioTracks = project.tracks.filter((t) => t.type === 'audio');

      // Download all source files
      const downloadedFiles: Record<string, string> = {};
      for (let i = 0; i < project.tracks.length; i++) {
        const track = project.tracks[i];
        const ext = track.type === 'video' ? '.mp4' : '.mp3';
        const localPath = path.join(tmpDir, `track_${i}${ext}`);
        await downloadFile(track.sourceUrl, localPath);
        downloadedFiles[track.id] = localPath;
        await job.updateProgress(((i + 1) / project.tracks.length) * 30);
      }

      const outputPath = path.join(tmpDir, 'output.mp4');

      // Build FFmpeg complex filter
      const inputArgs: string[] = [];
      const filterParts: string[] = [];
      let inputIndex = 0;

      const aspectMap: Record<string, { w: number; h: number }> = {
        '9:16': { w: 1080, h: 1920 },
        '16:9': { w: 1920, h: 1080 },
        '1:1': { w: 1080, h: 1080 },
      };
      const dim = aspectMap[project.aspectRatio] || aspectMap['9:16'];

      // Simple approach: concatenate video tracks sequentially, mix audio
      if (videoTracks.length === 0 && audioTracks.length > 0) {
        // Audio-only project: generate blank video with audio
        const audioInputs = audioTracks.map((t) => downloadedFiles[t.id]);
        const args = ['-y'];

        // Create black background video
        args.push('-f', 'lavfi', '-i', `color=c=black:s=${dim.w}x${dim.h}:d=300`);

        for (const audioPath of audioInputs) {
          args.push('-i', audioPath);
        }

        args.push(
          '-filter_complex', `amix=inputs=${audioInputs.length}:duration=longest`,
          '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k',
          '-shortest', '-movflags', '+faststart',
          outputPath
        );

        await execFileAsync('ffmpeg', args, { timeout: 600000 });
      } else if (videoTracks.length === 1 && audioTracks.length === 0) {
        // Single video, apply trim
        const track = videoTracks[0];
        const localPath = downloadedFiles[track.id];
        const args = ['-y', '-i', localPath];

        if (track.trimStart > 0) {
          args.push('-ss', track.trimStart.toString());
        }
        if (track.trimEnd) {
          args.push('-to', track.trimEnd.toString());
        }

        args.push(
          '-vf', `scale=${dim.w}:${dim.h}:force_original_aspect_ratio=decrease,pad=${dim.w}:${dim.h}:(ow-iw)/2:(oh-ih)/2:black`,
          '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k',
          '-movflags', '+faststart',
          outputPath
        );

        await execFileAsync('ffmpeg', args, { timeout: 600000 });
      } else {
        // Multiple tracks: use concat demuxer for videos + amix for audio
        const listFile = path.join(tmpDir, 'concat.txt');
        const trimmedPaths: string[] = [];

        // Pre-trim each video track
        for (let i = 0; i < videoTracks.length; i++) {
          const track = videoTracks[i];
          const localPath = downloadedFiles[track.id];

          if (track.trimStart > 0 || track.trimEnd) {
            const trimmedPath = path.join(tmpDir, `trimmed_${i}.mp4`);
            const trimArgs = ['-y', '-i', localPath];
            if (track.trimStart > 0) trimArgs.push('-ss', track.trimStart.toString());
            if (track.trimEnd) trimArgs.push('-to', track.trimEnd.toString());
            trimArgs.push(
              '-vf', `scale=${dim.w}:${dim.h}:force_original_aspect_ratio=decrease,pad=${dim.w}:${dim.h}:(ow-iw)/2:(oh-ih)/2:black`,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-c:a', 'aac', '-b:a', '128k',
              trimmedPath
            );
            await execFileAsync('ffmpeg', trimArgs, { timeout: 300000 });
            trimmedPaths.push(trimmedPath);
          } else {
            // Re-encode to normalize format
            const normalizedPath = path.join(tmpDir, `normalized_${i}.mp4`);
            await execFileAsync('ffmpeg', [
              '-y', '-i', localPath,
              '-vf', `scale=${dim.w}:${dim.h}:force_original_aspect_ratio=decrease,pad=${dim.w}:${dim.h}:(ow-iw)/2:(oh-ih)/2:black`,
              '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
              '-c:a', 'aac', '-b:a', '128k',
              normalizedPath,
            ], { timeout: 300000 });
            trimmedPaths.push(normalizedPath);
          }

          await job.updateProgress(30 + ((i + 1) / videoTracks.length) * 30);
        }

        // Write concat list
        fs.writeFileSync(listFile, trimmedPaths.map((p) => `file '${p}'`).join('\n'));

        if (audioTracks.length === 0) {
          // Just concat videos
          await execFileAsync('ffmpeg', [
            '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
            '-c', 'copy', '-movflags', '+faststart',
            outputPath,
          ], { timeout: 600000 });
        } else {
          // Concat videos + mix in audio tracks
          const concatVideoPath = path.join(tmpDir, 'concat_video.mp4');
          await execFileAsync('ffmpeg', [
            '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
            '-c', 'copy', concatVideoPath,
          ], { timeout: 600000 });

          const mixArgs = ['-y', '-i', concatVideoPath];
          for (const track of audioTracks) {
            mixArgs.push('-i', downloadedFiles[track.id]);
          }

          // Build audio filter: adjust volumes then mix
          const audioFilters: string[] = [];
          audioTracks.forEach((track, idx) => {
            audioFilters.push(`[${idx + 1}:a]volume=${track.volume}[a${idx}]`);
          });

          const mixInputs = audioTracks.map((_, idx) => `[a${idx}]`).join('');
          audioFilters.push(`[0:a]${mixInputs}amix=inputs=${audioTracks.length + 1}:duration=first[aout]`);

          mixArgs.push(
            '-filter_complex', audioFilters.join(';'),
            '-map', '0:v', '-map', '[aout]',
            '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart',
            outputPath
          );

          await execFileAsync('ffmpeg', mixArgs, { timeout: 600000 });
        }
      }

      await job.updateProgress(70);

      // Generate thumbnail
      const thumbPath = path.join(tmpDir, 'thumbnail.jpg');
      await generateThumbnail(outputPath, thumbPath);

      // Get duration
      const duration = await getVideoDuration(outputPath);

      await job.updateProgress(80);

      // Upload output video
      const videoBuffer = fs.readFileSync(outputPath);
      const { url: videoUrl } = await storageService.uploadFile(
        videoBuffer,
        `studio/${projectId}`,
        'output.mp4',
        'video/mp4'
      );

      // Upload thumbnail
      const thumbBuffer = fs.readFileSync(thumbPath);
      const { url: thumbUrl } = await storageService.uploadFile(
        thumbBuffer,
        `studio/${projectId}`,
        'thumbnail.jpg',
        'image/jpeg'
      );

      await job.updateProgress(95);

      // Update project
      await prisma.studioProject.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          outputUrl: videoUrl,
          thumbnailUrl: thumbUrl,
          totalDuration: duration,
        },
      });

      logger.info('Studio render complete', { projectId, duration });
    } catch (error: any) {
      logger.error('Studio render failed', { projectId, error: error.message });

      await prisma.studioProject.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });

      throw error;
    } finally {
      // Cleanup temp directory
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
