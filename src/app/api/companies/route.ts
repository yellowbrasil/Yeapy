import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/companies — buscar empresa do usuario logado
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("*, city:cities(id, name, state, slug), plan:plans(id, name, max_active_offers)")
    .eq("owner_id", user.id)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ company })
}

// PATCH /api/companies — atualizar perfil da empresa
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const {
    name,
    description,
    phone,
    whatsapp,
    address,
    cityId,
    state,
    socialLinks,
    logoUrl,
    logoSquareUrl,
    razaoSocial,
    responsavelNome,
    cep,
    documentoUrl,
  } = body

  // Check if profile is complete (has all required internal fields)
  const profileComplete = !!(razaoSocial && responsavelNome && address && cep && whatsapp)

  const { data: company, error } = await supabase
    .from("companies")
    .update({
      name,
      description: description || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      address: address || null,
      city_id: cityId || null,
      state: state || null,
      social_links: socialLinks || {},
      logo_url: logoUrl || null,
      logo_square_url: logoSquareUrl || null,
      razao_social: razaoSocial || null,
      responsavel_nome: responsavelNome || null,
      cep: cep || null,
      documento_url: documentoUrl || null,
      profile_complete: profileComplete,
    })
    .eq("owner_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ company })
}
