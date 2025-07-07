import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  UPLOAD_FOLDER: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().default('5MB'),
  APP_NAME: z.string().default('זמן זוגי'),
  APP_DESCRIPTION: z.string().default('מערכת השאלת משחקי זוגיות'),
  DEFAULT_LANGUAGE: z.string().default('he'),
})

export const env = envSchema.parse(process.env)