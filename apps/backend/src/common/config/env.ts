import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().optional().default(''),
  SESSION_SECRET: z.string().min(32).optional().default('change-me-in-production-min-32-chars!!'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(25),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  // MinIO (optional – used when MINIO_ENDPOINT is set, otherwise in-memory storage is used)
  MINIO_ENDPOINT: z.string().url().optional(),
  MINIO_ACCESS_KEY: z.string().optional().default(''),
  MINIO_SECRET_KEY: z.string().optional().default(''),
  MINIO_BUCKET: z.string().optional().default('sensor-demo-uploads'),
});

export const env = envSchema.parse(process.env);
