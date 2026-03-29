import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { env } from '../config/env';
import { v4 as uuid } from 'uuid';
import path from 'path';

export class StorageService {
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET;
  }

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
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
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async downloadToBuffer(key: string): Promise<Buffer> {
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
}

export const storageService = new StorageService();
