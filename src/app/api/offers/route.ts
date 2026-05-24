import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OFFER_DURATION_HOURS } from "@/lib/constants"

// GET /api/offers — listar ofertas ativas (publico)
export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const city = searchParams.get("city")
  const category = searchParams.get("category")
  const search = searchParams.get("q")
  const national = searchParams.get("national")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")

  let query = supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (city) {
    query = query.eq("city.slug", city)
  }
  if (category) {
    query = query.eq("category.slug", category)
  }
  if (national === "true") {
    query = query.eq("is_national", true)
  }
  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ offers: data, count })
}

// POST /api/offers — criar oferta (autenticado)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const {
    title,
    description,
    productName,
    categoryId,
    cityId,
    originalPriceCents,
    promotionalPriceCents,
    externalLink,
    whatsappLink,
    isNational,
    imageUrl,
  } = body

  // Buscar empresa do usuario
  const { data: company } = await supabase
    .from("companies")
    .select("id, plan_id")
    .eq("owner_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: "Empresa nao encontrada" }, { status: 404 })
  }

  // Verificar limite de ofertas ativas do plano
  const { count: activeOffers } = await supabase
    .from("offers")
    .select("id", { count: "exact" })
    .eq("company_id", company.id)
    .eq("status", "active")

  // Normalizar nome do produto
  const nameNormalized = productName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()

  // Buscar ou criar produto
  let { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", company.id)
    .eq("name_normalized", nameNormalized)
    .single()

  if (product) {
    // REGRA CRITICA: preco deve ser menor que o anterior
    if (product.last_offer_price_cents && promotionalPriceCents >= product.last_offer_price_cents) {
      return NextResponse.json(
        {
          error: `O preco promocional deve ser menor que R$ ${(product.last_offer_price_cents / 100).toFixed(2)} (ultimo preco deste produto).`,
          lastPrice: product.last_offer_price_cents,
        },
        { status: 400 }
      )
    }
  } else {
    // Criar produto novo
    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        company_id: company.id,
        name: productName,
        name_normalized: nameNormalized,
      })
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
    }
    product = newProduct
  }

  // Calcular expiracao
  const startsAt = new Date()
  const expiresAt = new Date(startsAt.getTime() + OFFER_DURATION_HOURS * 60 * 60 * 1000)

  // Criar oferta
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .insert({
      company_id: company.id,
      product_id: product.id,
      category_id: categoryId,
      city_id: cityId || null,
      title,
      description: description || null,
      image_url: imageUrl || null,
      original_price_cents: originalPriceCents,
      promotional_price_cents: promotionalPriceCents,
      external_link: externalLink || null,
      whatsapp_link: whatsappLink || null,
      is_national: isNational || false,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (offerError) {
    return NextResponse.json({ error: offerError.message }, { status: 500 })
  }

  // Atualizar produto (historico de preco)
  const lowestPrice = product.lowest_price_cents
    ? Math.min(product.lowest_price_cents, promotionalPriceCents)
    : promotionalPriceCents

  await supabase
    .from("products")
    .update({
      last_offer_price_cents: promotionalPriceCents,
      lowest_price_cents: lowestPrice,
      total_offers: (product.total_offers || 0) + 1,
    })
    .eq("id", product.id)

  // Registrar historico
  await supabase.from("offer_history").insert({
    product_id: product.id,
    company_id: company.id,
    offer_id: offer.id,
    promotional_price_cents: promotionalPriceCents,
    original_price_cents: originalPriceCents,
  })

  return NextResponse.json({ offer }, { status: 201 })
}
