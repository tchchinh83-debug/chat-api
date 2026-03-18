// lib/rag/rag.service.ts

import { embed } from "./embedding.service"
import { searchSimilar } from "@/db/vector.repository"
import { callGemini, LLMMessage } from "@/modules/llm/gemini.service"
import { reserveQuotaAtomic, commitUsage } from "@/modules/usage/quota.service"
import { estimateTokens, estimateChatTokens } from "@/utils/tokenEstimator"
import { limitLLM } from "@/utils/concurrency"
import { sanitizeDocument, sanitizeUserInput } from "./doc.sanitizer"
import { securityConfig } from "@/config/security"

const SYSTEM_PROMPT = `
You are a helpful assistant.
Answer strictly based on the provided context.
If the answer is not in the context, say you don't know.
`

const MAX_DOC_CHARS = securityConfig.rag.maxDocumentChars
const MAX_TOTAL_TOKENS = securityConfig.rag.maxTotalTokens

class RAGService {
  async handle(userId: string, message: string) {
    // ===== 1. DEFENSE-IN-DEPTH INPUT CHECK =====
    if (typeof message !== "string" || message.length > 4000) {
      throw new Error("Invalid input")
    }

    const cleanMessage = sanitizeUserInput(message)

    // ===== 2. EMBEDDING =====
    const embedding = await embed(cleanMessage)

    // ===== 3. VECTOR SEARCH =====
    const rawDocs = await searchSimilar(embedding, { tenantId: "default", topK: 5 })

    // ===== 4. SANITIZE & TRUNCATE DOCS =====
    const sanitizedDocs = rawDocs.map((d: any) =>
      sanitizeDocument(d.content || d.metadata?.content || "").slice(0, MAX_DOC_CHARS)
    )

    const context = sanitizedDocs.join("\n\n")

    // ===== 5. STRUCTURED MESSAGES =====
    const messages: LLMMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: context },
      { role: "user", content: cleanMessage }
    ]

    // ===== 6. TOKEN ESTIMATION =====
    const estimated = estimateChatTokens(messages as any)

    if (estimated > MAX_TOTAL_TOKENS) {
      throw new Error("Context too large")
    }

    // ===== 7. ATOMIC QUOTA RESERVE =====
    await reserveQuotaAtomic(userId, estimated)

    try {
      // ===== 8. GLOBAL LLM CONCURRENCY LIMIT =====
      const response = await limitLLM(() =>
        callGemini(messages)
      )

      // ===== 9. COMMIT USAGE =====
      await commitUsage(userId, estimated)

      return response
    } catch (err) {
      console.error("LLM_ERROR", err)
      throw new Error("LLM failure")
    }
  }
}

export const ragService = new RAGService()