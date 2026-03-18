
// modules/rag/doc.sanitizer.ts

export function sanitizeDocument(content: string): string {
  return content.replace(/<[^>]*>?/gm, '').trim();
}

export function sanitizeUserInput(input: string): string {
  return input.trim();
}
