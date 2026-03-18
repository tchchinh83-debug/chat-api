import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("8080"),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables")
  console.error(parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
