/**
 * Rough token estimation for LLM usage control
 * Overestimates slightly to avoid exceeding model limits.
 */

export function estimateTokens(text: string): number {
  if (!text) return 0

  const charCount = text.length

  // Heuristic:
  // English ≈ 4 chars/token
  // Vietnamese ≈ 3 chars/token
  const estimated = Math.ceil(charCount / 3.5)

  return estimated
}

/**
 * Estimate tokens for chat messages
 */
export function estimateChatTokens(
  messages: { role: string; content: string }[]
): number {
  let total = 0

  for (const msg of messages) {
    total += estimateTokens(msg.content)

    // Add overhead per message (role + metadata)
    total += 6
  }

  return total
}

/**
 * Ensure token limit
 */
export function enforceTokenLimit(
  text: string,
  maxTokens: number
): string {
  const estimated = estimateTokens(text)

  if (estimated <= maxTokens) return text

  // Rough truncate
  const maxChars = Math.floor(maxTokens * 3.5)
  return text.slice(0, maxChars)
}
