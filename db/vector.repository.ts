// lib/db/vector.repository.ts

import { vectorClient } from "@/db/vectorClient" // wrapper DB SDK
import { securityConfig } from "@/config/security"
import { VectorMetadata } from "@/types"

const VECTOR_DIMENSION = 768 // chỉnh theo model embed của bạn
const DEFAULT_TOP_K = 5
const MAX_TOP_K = 10

// ===============================
// TYPES
// ===============================

type UpsertInput = {
  id: string
  values: number[]
  metadata: VectorMetadata
}

type SearchOptions = {
  tenantId: string
  topK?: number
  visibility?: "private" | "public"
}

// ===============================
// INTERNAL VALIDATION
// ===============================

function validateEmbedding(values: number[]) {
  if (!Array.isArray(values)) {
    throw new Error("Invalid embedding format")
  }

  if (values.length !== VECTOR_DIMENSION) {
    throw new Error("Invalid embedding dimension")
  }
}

function validateMetadata(metadata: VectorMetadata) {
  if (!metadata.tenantId) {
    throw new Error("Missing tenantId")
  }

  if (!metadata.documentId) {
    throw new Error("Missing documentId")
  }
}

// ===============================
// UPSERT (WRITE)
// ===============================

export async function upsertVector(input: UpsertInput) {
  validateEmbedding(input.values)
  validateMetadata(input.metadata)

  try {
    await vectorClient.upsert({
      id: input.id,
      values: input.values,
      metadata: {
        ...input.metadata,
        tenantId: input.metadata.tenantId // force
      }
    })
  } catch (err) {
    console.error("VECTOR_UPSERT_ERROR", {
      id: input.id
    })
    throw new Error("Vector storage failure")
  }
}

// ===============================
// SEARCH (READ) - TENANT ISOLATED
// ===============================

export async function searchSimilar(
  embedding: number[],
  options: SearchOptions
) {
  validateEmbedding(embedding)

  if (!options?.tenantId) {
    throw new Error("Tenant isolation required")
  }

  const topK =
    Math.min(options.topK ?? DEFAULT_TOP_K, MAX_TOP_K)

  try {
    const results = await vectorClient.query({
      vector: embedding,
      topK,
      filter: {
        tenantId: options.tenantId,
        ...(options.visibility && {
          visibility: options.visibility
        })
      }
    })

    return results.matches ?? []
  } catch (err) {
    console.error("VECTOR_SEARCH_ERROR", {
      tenantId: options.tenantId
    })

    throw new Error("Vector search failure")
  }
}