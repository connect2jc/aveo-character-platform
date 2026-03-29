import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { env } from '../config/env';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

const LOCAL_UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const USE_LOCAL = optionalEnv('USE_LOCAL_STORAGE', '') === 'true' || !env.AWS_ACCESS_KEY_ID;

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export class StorageService {
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET;
    if (USE_LOCAL) {
      fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true }).catch(() => {});
      logger.info('StorageService: Using local file storage (no AWS credentials)');
    }
  }

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    if (USE_LOCAL) {
      return this.localUpload(buffer, key);
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    const url = `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key };
  }

  async uploadFile(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(filename);
    const key = `${folder}/${uuid()}${ext}`;
    return this.upload(buffer, key, contentType);
  }

  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const ext = path.extname(filename);
    const key = `${folder}/${uuid()}${ext}`;

    if (USE_LOCAL) {
      const publicUrl = `${env.API_URL || `http://localhost:${env.PORT}`}/uploads/${key}`;
      return { uploadUrl: publicUrl, key, publicUrl };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    const publicUrl = `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
  }

  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (USE_LOCAL) {
      return `${env.API_URL || `http://localhost:${env.PORT}`}/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    if (USE_LOCAL) {
      const filePath = path.join(LOCAL_UPLOADS_DIR, key);
      await fs.unlink(filePath).catch(() => {});
      return;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async downloadToBuffer(key: string): Promise<Buffer> {
    if (USE_LOCAL) {
      const filePath = path.join(LOCAL_UPLOADS_DIR, key);
      return fs.readFile(filePath);
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    const chunks: Uint8Array[] = [];

    if (response.Body) {
      const stream = response.Body as any;
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
    }

    return Buffer.concat(chunks);
  }

  private async localUpload(buffer: Buffer, key: string): Promise<{ url: string; key: string }> {
    const filePath = path.join(LOCAL_UPLOADS_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    const url = `${env.API_URL || `http://localhost:${env.PORT}`}/uploads/${key}`;
    return { url, key };
  }
}

export const storageService = new StorageService();
