import pLimit from "p-limit"

export const limitLLM = pLimit(5)
