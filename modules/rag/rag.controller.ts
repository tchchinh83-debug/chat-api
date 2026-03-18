
import { quotaService } from "../../modules/usage/quota.service"
import { estimateTokens } from "../../utils/tokenEstimator"
import { Router } from "express"
import { ragService } from "./rag.service"

const router = Router()

// Thay thế "..." bằng handleRag để sửa lỗi cú pháp Unexpected token ')'
router.post("/", handleRag as any)

export default router

export async function handleRag(req: { user: any; body: { prompt: any } }, res: { json: (arg0: any) => void }, next: (arg0: any) => void) {
  try {
    const userId = req.user?.sub || 'anonymous'
    const prompt = req.body.prompt

    const tokens = estimateTokens(prompt)

    await quotaService.addUsage(userId, tokens)

    const result = await ragService.handle(userId, prompt)

    res.json(result)
  } catch (err) {
    next(err)
  }
}
