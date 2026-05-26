import crypto from "crypto"

const CSRF_TOKEN_LENGTH = 32
const TOKEN_STORE = new Map<string, { token: string; expiresAt: number }>()

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

export function storeCsrfToken(sessionId: string, token: string): void {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  TOKEN_STORE.set(sessionId, { token, expiresAt })
}

export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = TOKEN_STORE.get(sessionId)

  if (!stored) {
    return false
  }

  if (Date.now() > stored.expiresAt) {
    TOKEN_STORE.delete(sessionId)
    return false
  }

  const isValid = crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token))

  if (isValid) {
    TOKEN_STORE.delete(sessionId)
  }

  return isValid
}

export function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [key, value] of TOKEN_STORE.entries()) {
    if (now > value.expiresAt) {
      TOKEN_STORE.delete(key)
    }
  }
}

setInterval(cleanupExpiredTokens, 60 * 60 * 1000) // Cleanup every hour
