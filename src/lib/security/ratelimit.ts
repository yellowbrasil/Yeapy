import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

// Simple in-memory store (NOT for production with multiple instances)
const store: RateLimitStore = {}

export async function checkRateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()

  if (!store[ip]) {
    store[ip] = { count: 1, resetTime: now + windowMs }
    return { allowed: true, remaining: limit - 1 }
  }

  const record = store[ip]

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + windowMs
    return { allowed: true, remaining: limit - 1 }
  }

  // Check limit
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}

export async function handleRateLimitError(remaining: number) {
  return NextResponse.json(
    {
      error: "Muitas requisições. Tente novamente em alguns instantes.",
      retryAfter: 60,
    },
    { status: 429, headers: { "Retry-After": "60" } }
  )
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  Object.entries(store).forEach(([key, value]) => {
    if (now > value.resetTime + 3600000) {
      delete store[key]
    }
  })
}, 3600000)
