import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '4000'), 10),

  DATABASE_URL: requireEnv('DATABASE_URL'),
  REDIS_URL: optionalEnv('REDIS_URL', 'redis://localhost:6379'),

  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRY: optionalEnv('JWT_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),

  STRIPE_SECRET_KEY: optionalEnv('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET', ''),

  ANTHROPIC_API_KEY: optionalEnv('ANTHROPIC_API_KEY', ''),
  FAL_API_KEY: optionalEnv('FAL_API_KEY', ''),
  ELEVENLABS_API_KEY: optionalEnv('ELEVENLABS_API_KEY', ''),
  HEYGEN_API_KEY: optionalEnv('HEYGEN_API_KEY', ''),
  OPENAI_API_KEY: optionalEnv('OPENAI_API_KEY', ''),

  ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY'),

  AWS_ACCESS_KEY_ID: optionalEnv('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: optionalEnv('AWS_SECRET_ACCESS_KEY', ''),
  AWS_S3_BUCKET: optionalEnv('AWS_S3_BUCKET', 'aveo-local'),
  AWS_REGION: optionalEnv('AWS_REGION', 'us-east-1'),

  RESEND_API_KEY: optionalEnv('RESEND_API_KEY', ''),

  APP_URL: optionalEnv('APP_URL', 'http://localhost:3000'),
  API_URL: optionalEnv('API_URL', 'http://localhost:4000'),
};
