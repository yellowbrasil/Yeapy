import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/track — registrar clique ou view
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { offerId, companyId, clickType } = body

  if (!offerId || !companyId || !clickType) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Registrar clique no historico
  await admin.from("offer_clicks").insert({
    offer_id: offerId,
    company_id: companyId,
    user_id: user?.id || null,
    click_type: clickType,
    ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
    user_agent: request.headers.get("user-agent") || null,
  })

  // Incrementar contadores na oferta
  if (clickType === "view") {
    // Fetch current count and increment
    const { data: offer } = await admin
      .from("offers")
      .select("views_count")
      .eq("id", offerId)
      .single()

    if (offer) {
      await admin
        .from("offers")
        .update({ views_count: (offer.views_count || 0) + 1 })
        .eq("id", offerId)
    }
  } else {
    // whatsapp or external_link
    const { data: offer } = await admin
      .from("offers")
      .select("clicks_count")
      .eq("id", offerId)
      .single()

    if (offer) {
      await admin
        .from("offers")
        .update({ clicks_count: (offer.clicks_count || 0) + 1 })
        .eq("id", offerId)
    }
  }

  return NextResponse.json({ ok: true })
}
