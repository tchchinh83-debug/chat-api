import express from "express"
import helmet from "helmet"
import cors from "cors"

import { rateLimiter, speedLimiter } from "./middleware/rateLimit"
import { securityHeaders } from "./middleware/securityHeaders"
import { errorHandler } from "./middleware/errorHandler"
import { authMiddleware } from "./middleware/auth"
import ragRouter from "./modules/rag/rag.controller"

const app = express()

/**
 * Security headers
 */
app.use(helmet())
app.use(securityHeaders as any)

/**
 * CORS
 */
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*"

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }) as any
)

/**
 * Body limit
 */
app.use(express.json({ limit: "1mb" }) as any)

/**
 * Rate limiting
 */
app.use(rateLimiter as any)
app.use(speedLimiter as any)

/**
 * Health check
 */
app.get("/health", (_, res) => res.json({ status: "ok" }))

/**
 * Routes
 */
app.use("/api/rag", authMiddleware as any, ragRouter)

/**
 * Error handler
 */
app.use(errorHandler as any)

/**
 * Start server
 */
const port = process.env.PORT || 8080

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
})