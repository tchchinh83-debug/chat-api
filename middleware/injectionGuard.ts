const patterns = [
  /ignore previous/i,
  /reveal system/i,
  /print context/i,
  /show hidden/i,
  /override/i,
]

export function injectionGuard(req, res, next) {
  const { message } = req.body

  if (!message || typeof message !== "string")
    return res.status(400).json({ error: "Invalid input" })

  if (patterns.some((p) => p.test(message))) {
    return res.status(400).json({
      error: "Prompt injection detected",
    })
  }

  next()
}
