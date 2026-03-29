import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const FAL_BASE_URL = 'https://queue.fal.run';

export class FalService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      'Authorization': `Key ${env.FAL_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  private getHeaders(apiKey?: string): Record<string, string> {
    if (apiKey) return { ...this.headers, 'Authorization': `Key ${apiKey}` };
    return this.headers;
  }

  async generateCharacterImage(prompt: string, count: number = 4, apiKey?: string): Promise<{ images: { url: string; seed: number }[] }> {
    logger.info('Generating character images via FAL', { prompt: prompt.slice(0, 80) });

    const response = await axios.post(
      `${FAL_BASE_URL}/fal-ai/flux/dev`,
      {
        prompt,
        image_size: 'portrait_4_3',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: count,
        enable_safety_checker: true,
      },
      { headers: this.getHeaders(apiKey), timeout: 120000 }
    );

    if (response.data.images) {
      return {
        images: response.data.images.map((img: any, i: number) => ({
          url: img.url,
          seed: img.seed || i,
        })),
      };
    }

    // Handle queued response
    const requestId = response.data.request_id;
    return this.pollResult(requestId, 60, apiKey);
  }

  async generateVariation(baseImageUrl: string, variationPrompt: string, apiKey?: string): Promise<{ url: string }> {
    logger.info('Generating image variation via FAL');

    const response = await axios.post(
      `${FAL_BASE_URL}/fal-ai/flux/dev/image-to-image`,
      {
        image_url: baseImageUrl,
        prompt: variationPrompt,
        strength: 0.65,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
      },
      { headers: this.getHeaders(apiKey), timeout: 120000 }
    );

    if (response.data.images?.[0]) {
      return { url: response.data.images[0].url };
    }

    const requestId = response.data.request_id;
    const result = await this.pollResult(requestId, 60, apiKey);
    return { url: result.images[0].url };
  }

  private async pollResult(requestId: string, maxAttempts: number = 60, apiKey?: string): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await axios.get(
        `${FAL_BASE_URL}/fal-ai/flux/dev/requests/${requestId}/status`,
        { headers: this.getHeaders(apiKey) }
      );

      if (statusResponse.data.status === 'COMPLETED') {
        const resultResponse = await axios.get(
          `${FAL_BASE_URL}/fal-ai/flux/dev/requests/${requestId}`,
          { headers: this.getHeaders(apiKey) }
        );
        return resultResponse.data;
      }

      if (statusResponse.data.status === 'FAILED') {
        throw new Error(`FAL generation failed: ${statusResponse.data.error || 'Unknown error'}`);
      }
    }

    throw new Error('FAL generation timed out');
  }
}

export const falService = new FalService();
