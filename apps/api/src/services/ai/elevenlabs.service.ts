import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class ElevenLabsService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      'xi-api-key': env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    };
  }

  async designVoice(prompt: string): Promise<{
    voiceId: string;
    previewUrl: string;
    name: string;
  }> {
    logger.info('Designing voice via ElevenLabs', { prompt: prompt.slice(0, 80) });

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-voice/create-previews`,
      {
        voice_description: prompt,
        text: 'Hey, what is up everyone! Welcome back to my channel. Today we are going to talk about something that completely changed my perspective.',
      },
      { headers: this.headers, timeout: 60000 }
    );

    const preview = response.data.previews?.[0];
    if (!preview) {
      throw new Error('No voice preview generated');
    }

    return {
      voiceId: preview.generated_voice_id,
      previewUrl: preview.audio_url || '',
      name: `aveo_voice_${Date.now()}`,
    };
  }

  async textToSpeech(
    voiceId: string,
    text: string,
    settings?: VoiceSettings
  ): Promise<Buffer> {
    logger.info('Generating TTS via ElevenLabs', { voiceId, textLength: text.length });

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: settings?.stability ?? 0.5,
          similarity_boost: settings?.similarity_boost ?? 0.75,
          style: settings?.style ?? 0.5,
          use_speaker_boost: settings?.use_speaker_boost ?? true,
        },
      },
      {
        headers: this.headers,
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );

    return Buffer.from(response.data);
  }

  async listVoices(): Promise<Array<{
    voice_id: string;
    name: string;
    category: string;
    labels: Record<string, string>;
    preview_url: string;
  }>> {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: this.headers,
    });

    return response.data.voices || [];
  }

  async getVoice(voiceId: string): Promise<any> {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async deleteVoice(voiceId: string): Promise<void> {
    await axios.delete(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      headers: this.headers,
    });
  }
}

export const elevenLabsService = new ElevenLabsService();
