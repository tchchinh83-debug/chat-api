const MAX_MESSAGES = 20

export async function generateFromGemini(
  userMessages: LLMMessage[],
  options?: GeminiOptions
): Promise<string> {

  if (!Array.isArray(userMessages) || userMessages.length === 0) {
    throw new Error("Invalid LLM input")
  }

  const trimmed = userMessages.slice(-MAX_MESSAGES)

  for (const msg of trimmed) {
    if (msg.content.length > securityConfig.input.maxMessageLength) {
      throw new Error("Message too long")
    }
  }

  const messages = buildMessages(
    trimmed,
    options?.systemPrompt
  )

  try {

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), 15000)
    )

    const response = await Promise.race([
      callGemini(messages),
      timeout
    ])

    return response

  } catch (err) {

    console.error("GEMINI_SERVICE_ERROR", {
      messageCount: messages.length
    })

    throw new Error("AI service unavailable")
  }
}