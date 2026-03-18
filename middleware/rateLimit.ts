import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down"

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
})

export const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 10,
  delayMs: 500,
})
