// types.ts

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  reaction?: string;
}

// =====================================
// AUTH / USER
// =====================================

export type UserRole = "user" | "admin"

export type AuthUser = {
  id: string
  tenantId: string
  role: UserRole
  plan: "free" | "pro"
}

// =====================================
// LLM
// =====================================

export type LLMRole = "system" | "user" | "assistant"

export type LLMMessage = {
  role: LLMRole
  content: string
}

export type LLMResponse = {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// =====================================
// RAG
// =====================================

export type RetrievedDocument = {
  id: string
  score: number
  content: string
  metadata: VectorMetadata
}

export type RAGRequest = {
  userId: string
  tenantId: string
  message: string
}

export type RAGResponse = {
  answer: string
  sources?: Array<{
    documentId: string
    title?: string
    source?: string
  }>
}

// =====================================
// VECTOR DB
// =====================================

export type VectorMetadata = {
  tenantId: string
  documentId: string
  title?: string
  source?: string
  visibility?: "private" | "public"
  chunkIndex?: number
  deleted?: boolean
}

export type VectorUpsertInput = {
  id: string
  values: number[]
  metadata: VectorMetadata
}

export type VectorSearchOptions = {
  tenantId: string
  topK?: number
  visibility?: "private" | "public"
}

// =====================================
// KNOWLEDGE BASE
// =====================================

export type IngestDocumentInput = {
  documentId: string
  tenantId: string
  title: string
  content: string
  source?: string
  visibility?: "private" | "public"
}

// =====================================
// USAGE / QUOTA
// =====================================

export type UsageRecord = {
  userId: string
  tenantId: string
  tokens: number
  timestamp: number
}

export type PlanLimits = {
  maxTokensPerRequest: number
  maxTokensPerMonth: number
  maxDocuments: number
}

// =====================================
// ERROR SHAPES
// =====================================

export type ServiceErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "QUOTA_EXCEEDED"
  | "INVALID_INPUT"
  | "VECTOR_ERROR"
  | "LLM_ERROR"
  | "INTERNAL_ERROR"

export type ServiceError = {
  code: ServiceErrorCode
  message: string
}