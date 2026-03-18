
// services/ingestionService.ts

import { embed } from "@/modules/rag/embedding.service"
import { upsertVector } from "@/db/vector.repository"
import { securityConfig } from "@/config/security"

type IngestDocumentInput = {
  id: string
  title: string
  content: string
  source?: string
}

const MAX_DOCUMENT_SIZE = 50_000 // chars
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

// ==============================
// SANITIZATION
// ==============================

function stripHTML(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, "")
}

function removeScripts(input: string): string {
  return input.replace(/<script.*?>.*?<\/script>/gi, "")
}

function removePromptInjectionPatterns(input: string): string {
  return input.replace(/ignore previous instructions/gi, "")
}

function sanitizeContent(input: string): string {
  return removePromptInjectionPatterns(
    stripHTML(removeScripts(input))
  ).trim()
}

// ==============================
// CHUNKING
// ==============================

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = start + CHUNK_SIZE
    chunks.push(text.slice(start, end))
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

// ==============================
// INGEST
// ==============================

export async function ingestDocument(
  input: IngestDocumentInput
) {
  if (!input.id || !input.content) {
    throw new Error("Invalid document")
  }

  if (input.content.length > MAX_DOCUMENT_SIZE) {
    throw new Error("Document too large")
  }

  const sanitized = sanitizeContent(input.content)

  if (sanitized.length === 0) {
    throw new Error("Empty document after sanitization")
  }

  const chunks = chunkText(sanitized)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    if (chunk.length < 50) continue // bỏ chunk quá nhỏ

    const embedding = await embed(chunk)

    await upsertVector({
      id: `${input.id}_${i}`,
      values: embedding,
      metadata: {
        tenantId: "default",
        documentId: input.id,
        title: input.title,
        source: input.source ?? "unknown",
        chunkIndex: i
      }
    })
  }

  return {
    success: true,
    chunkCount: chunks.length
  }
}
