import { NextRequest, NextResponse } from "next/server"

const SESSION_TIMEOUT_MINUTES = 30
const SESSION_ACTIVITY_STORE = new Map<string, number>()

export function getSessionTimoutMs(): number {
  return SESSION_TIMEOUT_MINUTES * 60 * 1000
}

export function updateSessionActivity(sessionId: string): void {
  SESSION_ACTIVITY_STORE.set(sessionId, Date.now())
}

export function isSessionExpired(sessionId: string): boolean {
  const lastActivity = SESSION_ACTIVITY_STORE.get(sessionId)

  if (!lastActivity) {
    return true
  }

  const elapsed = Date.now() - lastActivity
  const timeoutMs = getSessionTimoutMs()

  return elapsed > timeoutMs
}

export function clearSession(sessionId: string): void {
  SESSION_ACTIVITY_STORE.delete(sessionId)
}

export function checkSessionTimeout(request: NextRequest): { isExpired: boolean; sessionId?: string } {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return { isExpired: false }
  }

  const sessionId = extractSessionId(authHeader)

  if (!sessionId) {
    return { isExpired: false }
  }

  const isExpired = isSessionExpired(sessionId)

  if (isExpired) {
    clearSession(sessionId)
  }

  return { isExpired, sessionId }
}

export function extractSessionId(authHeader: string): string | null {
  const parts = authHeader.split(" ")
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1]
  }
  return null
}

export function createSessionTimeoutResponse(): NextResponse {
  return NextResponse.json(
    { error: "Sessão expirada por inatividade. Faça login novamente." },
    { status: 401 }
  )
}

export function cleanupExpiredSessions(): void {
  const now = Date.now()
  const timeoutMs = getSessionTimoutMs()

  for (const [sessionId, lastActivity] of SESSION_ACTIVITY_STORE.entries()) {
    if (now - lastActivity > timeoutMs) {
      SESSION_ACTIVITY_STORE.delete(sessionId)
    }
  }
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000) // Cleanup every 5 minutes
