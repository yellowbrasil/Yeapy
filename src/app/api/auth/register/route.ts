import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, companyName, slug, whatsapp } = body

  if (!email || !password || !companyName || !slug || !whatsapp) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatórios." },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Check if slug is already taken
  const { data: existingCompany } = await admin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single()

  if (existingCompany) {
    return NextResponse.json(
      { error: "Esta URL já está em uso. Escolha outra." },
      { status: 409 }
    )
  }

  // Create user with admin (auto-confirms email)
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (userError) {
    if (userError.message?.includes("already been registered")) {
      return NextResponse.json(
        { error: "Este email já está cadastrado. Tente fazer login." },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: "Esta URL já está em uso. Escolha outra." },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar empresa. Tente novamente." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, userId: userData.user.id })
}
