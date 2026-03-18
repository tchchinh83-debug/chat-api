export const securityConfig = {

  app: {
    name: "bhxh-chatbot",
    environment: process.env.NODE_ENV ?? "development"
  },

  rateLimit: {
    ip: {
      windowSeconds: 60,
      maxRequests: 15
    },
    globalLLMConcurrency: 5
  },

  quota: {
    dailyRequestLimit: 200
  },

  input: {
    maxMessageLength: 2000,
    minMessageLength: 1
  },

  cors: {
    allowedOrigins: [
      "http://localhost:3000",
      "https://yourdomain.com"
    ]
  },

  llm: {
    requestTimeoutMs: 20000,
    maxMessages: 20
  },

  flags: {
    enableAbuseDetection: true,
    enableStrictContextValidation: true,
    enablePromptInjectionFilter: true,
    maskDetailedErrorsInProduction: true
  }

}