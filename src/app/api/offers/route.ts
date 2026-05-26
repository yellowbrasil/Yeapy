import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OFFER_DURATION_HOURS } from "@/lib/constants"
import { checkRateLimit } from "@/lib/security/ratelimit"
import { addCorsHeaders } from "@/lib/security/cors"

const createOfferSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  productName: z.string().min(2).max(200),
  categoryId: z.string().uuid(),
  cityId: z.string().uuid(),
  originalPriceCents: z.number().positive(),
  promotionalPriceCents: z.number().positive(),
  externalLink: z.string().url().optional(),
  whatsappLink: z.string().url().optional(),
  isNational: z.boolean(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  deliveryAreas: z.array(z.string()).optional(),
})

// GET /api/offers — listar ofertas ativas (publico)
export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  // Sanitize inputs
  const city = searchParams.get("city")?.slice(0, 100) || null
  const category = searchParams.get("category")?.slice(0, 100) || null
  const search = searchParams.get("q")?.slice(0, 200) || null
  const national = searchParams.get("national")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100) // Max 100
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0)

  let query = supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp, is_verified),
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
    const response = NextResponse.json({ error: error.message }, { status: 500 })
    return addCorsHeaders(response)
  }

  const response = NextResponse.json({ offers: data, count })
  return addCorsHeaders(response)
}

// POST /api/offers — criar oferta (autenticado)
export async function POST(request: NextRequest) {
  // Rate limiting: máximo 20 ofertas por minuto por IP (por anunciante)
  const { allowed } = await checkRateLimit(request, 20, 60000)
  if (!allowed) {
    const response = NextResponse.json(
      { error: "Muitas requisições. Tente novamente em alguns instantes." },
      { status: 429 }
    )
    return addCorsHeaders(response)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const response = NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    return addCorsHeaders(response)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    const response = NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    return addCorsHeaders(response)
  }

  // Validar com Zod
  let data: z.infer<typeof createOfferSchema>
  try {
    data = createOfferSchema.parse(body)
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
    images,
    deliveryAreas,
  } = data

  // Buscar empresa do usuario
  const { data: company } = await supabase
    .from("companies")
    .select("id, plan_id, profile_complete")
    .eq("owner_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
  }

  // Check if profile is complete before allowing offer creation
  if (!company.profile_complete) {
    return NextResponse.json(
      { error: "Complete seu perfil antes de publicar ofertas. Acesse Perfil da empresa." },
      { status: 403 }
    )
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
    // REGRA CRÍTICA: preço deve ser menor que o anterior
    if (product.last_offer_price_cents && promotionalPriceCents >= product.last_offer_price_cents) {
      return NextResponse.json(
        {
          error: `O preço promocional deve ser menor que R$ ${(product.last_offer_price_cents / 100).toFixed(2)} (último preço deste produto).`,
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

  // Calcular expiração
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
      image_url: imageUrl || (images && images.length > 0 ? images[0] : null),
      images: images || [],
      original_price_cents: originalPriceCents,
      promotional_price_cents: promotionalPriceCents,
      external_link: externalLink || null,
      whatsapp_link: whatsappLink || null,
      is_national: isNational || false,
      delivery_areas: deliveryAreas || [],
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (offerError) {
    const response = NextResponse.json({ error: offerError.message }, { status: 500 })
    return addCorsHeaders(response)
  }

  // Atualizar produto (histórico de preço)
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

  // Registrar histórico
  await supabase.from("offer_history").insert({
    product_id: product.id,
    company_id: company.id,
    offer_id: offer.id,
    promotional_price_cents: promotionalPriceCents,
    original_price_cents: originalPriceCents,
  })

  const response = NextResponse.json({ offer }, { status: 201 })
  return addCorsHeaders(response)
}
