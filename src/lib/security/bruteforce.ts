import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export interface BruteForceCheck {
  allowed: boolean
  attemptsLeft: number
  lockedUntil?: Date
  message?: string
}

export async function checkBruteForce(
  identifier: string, // email ou IP
  ipAddress: string,
  identifierType: "email" | "ip" = "email"
): Promise<BruteForceCheck> {
  const admin = createAdminClient()
  const now = new Date()
  const lockoutThreshold = new Date(now.getTime() - LOCKOUT_DURATION_MINUTES * 60 * 1000)

  try {
    // Buscar tentativas falhadas recentes
    const { data: attempts, error } = await admin
      .from("login_attempts")
      .select("*")
      .eq(identifierType === "email" ? "email" : "ip_address", identifier)
      .eq("success", false)
      .gt("created_at", lockoutThreshold.toISOString())

    if (error) {
      console.error("Erro ao verificar brute force:", error)
      // Em caso de erro, deixa passar (fail open)
      return { allowed: true, attemptsLeft: MAX_ATTEMPTS }
    }

    const failedAttempts = attempts?.length || 0

    if (failedAttempts >= MAX_ATTEMPTS) {
      // Usuário está bloqueado
      const oldestAttempt = new Date(attempts![0].created_at)
      const lockedUntil = new Date(oldestAttempt.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)

      if (now < lockedUntil) {
        const minutesLeft = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000)

        return {
          allowed: false,
          attemptsLeft: 0,
          lockedUntil,
          message: `Muitas tentativas de login. Tente novamente em ${minutesLeft} minutos.`,
        }
      }
    }

    return {
      allowed: true,
      attemptsLeft: MAX_ATTEMPTS - failedAttempts,
    }
  } catch (error) {
    console.error("Erro crítico em brute force check:", error)
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS }
  }
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
): Promise<void> {
  const admin = createAdminClient()

  try {
    await admin.from("login_attempts").insert({
      email,
      ip_address: ipAddress,
      success,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao registrar tentativa de login:", error)
  }
}

export async function clearBruteForceAttempts(email: string): Promise<void> {
  const admin = createAdminClient()

  try {
    await admin
      .from("login_attempts")
      .delete()
      .eq("email", email)
      .eq("success", false)
  } catch (error) {
    console.error("Erro ao limpar tentativas:", error)
  }
}

export function getIpFromRequest(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}
