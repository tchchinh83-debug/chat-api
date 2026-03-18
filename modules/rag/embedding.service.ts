// modules/rag/embedding.service.ts

interface EmbeddingResponse {
  embedding: {
    values: number[]
  }
}

export async function embed(text: string): Promise<number[]> {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for embedding")
  }

  const response = await fetch(
    process.env.GEMINI_EMBEDDING_ENDPOINT as string,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: {
          parts: [{ text }],
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error: ${error}`)
  }

  const data = (await response.json()) as EmbeddingResponse

  return data.embedding.values
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  // Gemini API supports batch embedding, but for simplicity and reliability 
  // we can map over the texts. In production, use the batch endpoint.
  return Promise.all(texts.map(text => embed(text)))
}
