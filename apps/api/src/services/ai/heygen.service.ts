import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const HEYGEN_BASE_URL = 'https://api.heygen.com/v2';

export class HeygenService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      'X-Api-Key': env.HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    };
  }

  async createPhotoToVideo(
    imageUrl: string,
    audioUrl: string,
    motionPrompt?: string
  ): Promise<{ jobId: string }> {
    logger.info('Creating HeyGen photo-to-video', { imageUrl: imageUrl.slice(0, 50) });

    const response = await axios.post(
      `${HEYGEN_BASE_URL}/video/generate`,
      {
        video_inputs: [
          {
            character: {
              type: 'photo',
              photo_url: imageUrl,
            },
            voice: {
              type: 'audio',
              audio_url: audioUrl,
            },
            ...(motionPrompt && {
              background: {
                type: 'color',
                value: '#FFFFFF',
              },
            }),
          },
        ],
        dimension: {
          width: 1080,
          height: 1920,
        },
      },
      { headers: this.headers, timeout: 30000 }
    );

    const jobId = response.data.data?.video_id;
    if (!jobId) {
      throw new Error('HeyGen did not return a video ID');
    }

    logger.info('HeyGen job created', { jobId });
    return { jobId };
  }

  async getVideoStatus(jobId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
  }> {
    const response = await axios.get(
      `${HEYGEN_BASE_URL}/video_status.get?video_id=${jobId}`,
      { headers: this.headers }
    );

    const data = response.data.data;

    if (data.status === 'completed') {
      return {
        status: 'completed',
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
      };
    }

    if (data.status === 'failed') {
      return {
        status: 'failed',
        error: data.error || 'Video generation failed',
      };
    }

    return { status: 'processing' };
  }

  async downloadVideo(jobId: string): Promise<string> {
    const status = await this.getVideoStatus(jobId);
    if (status.status !== 'completed' || !status.videoUrl) {
      throw new Error(`Video not ready. Status: ${status.status}`);
    }
    return status.videoUrl;
  }

  async listAvatars(): Promise<any[]> {
    const response = await axios.get(`${HEYGEN_BASE_URL}/avatars`, {
      headers: this.headers,
    });
    return response.data.data?.avatars || [];
  }

  async getRemainingCredits(): Promise<number> {
    const response = await axios.get(`${HEYGEN_BASE_URL}/user/remaining_quota`, {
      headers: this.headers,
    });
    return response.data.data?.remaining_quota || 0;
  }
}

export const heygenService = new HeygenService();
