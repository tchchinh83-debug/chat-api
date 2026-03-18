// lib/security/inputValidator.ts

import { z } from "zod"
import { securityConfig } from "@/config/security"

// ==============================
// BASE SANITIZATION
// ==============================

function stripControlCharacters(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, "")
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim()
}

function basicSanitize(input: string): string {
  return normalizeWhitespace(stripControlCharacters(input))
}

// ==============================
// CHAT MESSAGE VALIDATION
// ==============================

const chatSchema = z.object({
  message: z
    .string()
    .min(securityConfig.input.minMessageLength)
    .max(securityConfig.input.maxMessageLength)
})

export type ChatInput = {
  message: string
}

export function validateChatInput(body: unknown): ChatInput {
  const parsed = chatSchema.safeParse(body)

  if (!parsed.success) {
    throw new Error("Invalid input")
  }

  const sanitizedMessage = basicSanitize(parsed.data.message)

  if (sanitizedMessage.length === 0) {
    throw new Error("Empty message")
  }

  return {
    message: sanitizedMessage
  }
}

// ==============================
// OPTIONAL: GENERIC VALIDATOR
// ==============================

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    throw new Error("Invalid input")
  }

  return parsed.data
}