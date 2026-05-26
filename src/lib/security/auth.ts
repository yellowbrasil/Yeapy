import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "anunciante" | "user" | null

export async function getUserRole(userId: string): Promise<UserRole> {
  const client = await createClient()

  // Verificar se é admin (dono da plataforma)
  const { data: adminData } = await client
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (adminData) return "admin"

  // Verificar se é anunciante (tem empresa)
  const { data: companyData } = await client
    .from("companies")
    .select("id")
    .eq("owner_id", userId)
    .single()

  if (companyData) return "anunciante"

  // Padrão: usuário normal
  return "user"
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ allowed: boolean; userId?: string; role?: UserRole; error?: NextResponse }> {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return {
      allowed: false,
      error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    }
  }

  const role = await getUserRole(user.id)

  if (!allowedRoles.includes(role)) {
    return {
      allowed: false,
      error: NextResponse.json(
        { error: "Acesso negado. Rol requerida:" + allowedRoles.join(", ") },
        { status: 403 }
      ),
    }
  }

  return { allowed: true, userId: user.id, role }
}

export function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}
