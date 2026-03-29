import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const execFileAsync = promisify(execFile);

export interface StitchOptions {
  clipPaths: string[];
  outputPath: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  addCaptions?: boolean;
  captionsSrtPath?: string;
}

const ASPECT_RATIO_MAP: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
  '1:1': { width: 1080, height: 1080 },
};

export async function stitchClips(options: StitchOptions): Promise<string> {
  const { clipPaths, outputPath, aspectRatio = '9:16', addCaptions, captionsSrtPath } = options;
  const dimensions = ASPECT_RATIO_MAP[aspectRatio];

  const tmpDir = path.dirname(outputPath);
  const listFile = path.join(tmpDir, `concat_${Date.now()}.txt`);

  const listContent = clipPaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(listFile, listContent);

  try {
    const filterParts: string[] = [
      `scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease`,
      `pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2:black`,
    ];

    const args: string[] = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-vf', filterParts.join(','),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
    ];

    if (addCaptions && captionsSrtPath && fs.existsSync(captionsSrtPath)) {
      args.push('-vf', `${filterParts.join(',')},subtitles=${captionsSrtPath}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'`);
    }

    args.push(outputPath);

    logger.info('Running ffmpeg stitch', { clipCount: clipPaths.length, outputPath });
    await execFileAsync('ffmpeg', args, { timeout: 300000 });

    return outputPath;
  } finally {
    if (fs.existsSync(listFile)) {
      fs.unlinkSync(listFile);
    }
  }
}

export async function generateThumbnail(videoPath: string, outputPath: string): Promise<string> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i', videoPath,
    '-ss', '00:00:01',
    '-vframes', '1',
    '-q:v', '2',
    outputPath,
  ]);
  return outputPath;
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    videoPath,
  ]);
  return Math.round(parseFloat(stdout.trim()));
}
