import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/security/ratelimit"
import { addCorsHeaders } from "@/lib/security/cors"
import {
  checkBruteForce,
  recordLoginAttempt,
  clearBruteForceAttempts,
  getIpFromRequest,
} from "@/lib/security/bruteforce"
import { logSecurityEvent } from "@/lib/security/logs"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

export async function POST(request: NextRequest) {
  // Rate limiting geral: 10 requisições por minuto
  const { allowed: rateLimitAllowed } = await checkRateLimit(request, 10, 60000)
  if (!rateLimitAllowed) {
    const response = NextResponse.json(
      { error: "Muitas requisições. Tente novamente em alguns instantes." },
      { status: 429 }
    )
    return addCorsHeaders(response)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    const response = NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    return addCorsHeaders(response)
  }

  // Validar dados
  let data: z.infer<typeof loginSchema>
  try {
    data = loginSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }
    const response = NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    return addCorsHeaders(response)
  }

  const { email, password } = data
  const ipAddress = getIpFromRequest(request)

  // VERIFICAR BRUTE FORCE
  const bruteForceCheck = await checkBruteForce(email, ipAddress, "email")
  if (!bruteForceCheck.allowed) {
    const response = NextResponse.json(
      { error: bruteForceCheck.message },
      { status: 429 }
    )
    return addCorsHeaders(response)
  }

  // Tentar fazer login via Supabase
  const supabase = await createClient()
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // LOGIN FALHOU - registrar tentativa
    await recordLoginAttempt(email, ipAddress, false)
    await logSecurityEvent(
      "login_failed",
      null,
      null,
      {
        email,
        reason: signInError.message,
        attemptNumber: bruteForceCheck.attemptsLeft === 0 ? MAX_ATTEMPTS : MAX_ATTEMPTS - bruteForceCheck.attemptsLeft + 1,
      },
      ipAddress
    )

    const response = NextResponse.json(
      {
        error: "Email ou senha inválidos",
        attemptsLeft: bruteForceCheck.attemptsLeft - 1,
      },
      { status: 401 }
    )
    return addCorsHeaders(response)
  }

  // LOGIN BEM-SUCEDIDO
  if (signInData.user) {
    // Limpar tentativas falhadas anteriores
    await clearBruteForceAttempts(email)

    // Registrar tentativa bem-sucedida
    await recordLoginAttempt(email, ipAddress, true)

    // Logar sucesso
    await logSecurityEvent(
      "login_success",
      signInData.user.id,
      null,
      {
        email,
        userId: signInData.user.id,
      },
      ipAddress
    )

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
        },
        session: signInData.session,
      },
      { status: 200 }
    )
    return addCorsHeaders(response)
  }

  const response = NextResponse.json(
    { error: "Erro ao fazer login. Tente novamente." },
    { status: 500 }
  )
  return addCorsHeaders(response)
}

// Constante que faltava no import
const MAX_ATTEMPTS = 5
