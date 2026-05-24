import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// GET /api/cron/expire — expirar ofertas automaticamente
// Chamado por cron job a cada 5 minutos
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("offers")
    .update({ status: "expired" })
    .eq("status", "active")
    .lte("expires_at", new Date().toISOString())
    .select("id")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `${data?.length || 0} ofertas expiradas`,
    expired: data?.length || 0,
  })
}
