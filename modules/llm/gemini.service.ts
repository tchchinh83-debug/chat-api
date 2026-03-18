// modules/llm/gemini.service.ts

import { securityConfig } from "@/config/security"

type Role = "system" | "user" | "assistant"

export type LLMMessage = {
  role: Role
  content: string
}

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

const REQUEST_TIMEOUT_MS = 20_000
const MAX_MESSAGES = 20

// ==============================
// INTERNAL HELPERS
// ==============================

function validateMessages(messages: LLMMessage[]) {
  if (!Array.isArray(messages)) {
    throw new Error("Invalid messages")
  }

  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error("Invalid message length")
  }

  for (const msg of messages) {
    if (
      !msg ||
      typeof msg.content !== "string" ||
      !["system", "user", "assistant"].includes(msg.role)
    ) {
      throw new Error("Invalid message structure")
    }

    if (msg.content.length === 0) {
      throw new Error("Empty message content")
    }
  }
}

function buildGeminiPayload(messages: LLMMessage[]) {
  // Gemini không có role "system" native → gộp vào đầu user context
  const formatted = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }))

  return {
    contents: formatted,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024
    }
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

// ==============================
// MAIN CALL FUNCTION
// ==============================

export async function callGemini(
  messages: LLMMessage[]
): Promise<string> {
  validateMessages(messages)

  const payload = buildGeminiPayload(messages)

  const response = await fetchWithTimeout(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    },
    REQUEST_TIMEOUT_MS
  )

  if (!response.ok) {
    const text = await response.text()
    console.error("GEMINI_API_ERROR", text)
    throw new Error("LLM provider error")
  }

  const data = await response.json()

  try {
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("Empty LLM response")
    }

    return text.trim()
  } catch (err) {
    console.error("GEMINI_PARSE_ERROR", err)
    throw new Error("Invalid LLM response format")
  }
}