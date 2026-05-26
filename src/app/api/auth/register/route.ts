import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, handleRateLimitError } from "@/lib/security/ratelimit"
import { addCorsHeaders } from "@/lib/security/cors"
import { validateBrazilianDocument } from "@/lib/security/cpf-cnpj"

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  companyName: z.string().min(2).max(200),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  whatsapp: z.string().optional(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Rate limiting: máximo 5 registros por minuto por IP
  const { allowed } = await checkRateLimit(request, 5, 60000)
  if (!allowed) {
    const response = NextResponse.json(
      { error: "Muitas tentativas de registro. Tente novamente em 1 minuto." },
      { status: 429 }
    )
    return addCorsHeaders(response)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    const response = NextResponse.json(
      { error: "JSON inválido" },
      { status: 400 }
    )
    return addCorsHeaders(response)
  }

  // Validação com Zod
  let data: z.infer<typeof registerSchema>
  try {
    data = registerSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }
    const response = NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 }
    )
    return addCorsHeaders(response)
  }

  const { email, password, companyName, slug, whatsapp, cpf, cnpj } = data

  // Validar CPF ou CNPJ se fornecido
  if (cpf && !validateBrazilianDocument(cpf, "cpf")) {
    const response = NextResponse.json(
      { error: "CPF inválido. Verifique o número informado." },
      { status: 400 }
    )
    return addCorsHeaders(response)
  }

  if (cnpj && !validateBrazilianDocument(cnpj, "cnpj")) {
    const response = NextResponse.json(
      { error: "CNPJ inválido. Verifique o número informado." },
      { status: 400 }
    )
    return addCorsHeaders(response)
  }

  const admin = createAdminClient()

  try {
    // Check if slug is already taken
    const { data: existingCompany } = await admin
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existingCompany) {
      const response = NextResponse.json(
        { error: "Esta URL já está em uso. Escolha outra." },
        { status: 409 }
      )
      return addCorsHeaders(response)
    }
  } catch (error) {
    // Slug doesn't exist, which is good
  }

  // Create user with admin (auto-confirms email)
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (userError) {
    if (userError.message?.includes("already been registered")) {
      const response = NextResponse.json(
        { error: "Este email já está cadastrado. Tente fazer login." },
        { status: 409 }
      )
      return addCorsHeaders(response)
    }
    const response = NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }

  // Create company with admin client (bypasses RLS), is_active = false until payment
  const { error: companyError } = await admin.from("companies").insert({
    owner_id: userData.user.id,
    name: companyName,
    slug,
    whatsapp: whatsapp || null,
    is_active: false,
  })

  if (companyError) {
    // Rollback: delete the user we just created
    await admin.auth.admin.deleteUser(userData.user.id)

    if (companyError.code === "23505") {
      const response = NextResponse.json(
        { error: "Esta URL já está em uso. Escolha outra." },
        { status: 409 }
      )
      return addCorsHeaders(response)
    }
    const response = NextResponse.json(
      { error: "Erro ao cadastrar empresa. Tente novamente." },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }

  const response = NextResponse.json(
    { ok: true, userId: userData.user.id },
    { status: 201 }
  )
  return addCorsHeaders(response)
}
