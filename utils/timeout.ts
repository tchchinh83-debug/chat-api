export async function withAbortTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)

  try {
    return await fn(controller.signal)
  } finally {
    clearTimeout(timeout)
  }
}
