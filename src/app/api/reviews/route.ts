import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const companyId = request.nextUrl.searchParams.get("company_id")

  if (!companyId) {
    return NextResponse.json({ error: "company_id é obrigatório" }, { status: 400 })
  }

  const { data: reviews, error } = await supabase
    .from("company_reviews")
    .select(`
      *,
      user:auth.users(id, email),
      responses:company_review_responses(*)
    `)
    .eq("company_id", companyId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { company_id, rating, title, comment } = body

  if (!company_id || !rating || !title) {
    return NextResponse.json(
      { error: "company_id, rating e title são obrigatórios" },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "rating deve estar entre 1 e 5" },
      { status: 400 }
    )
  }

  const { data: review, error } = await supabase
    .from("company_reviews")
    .insert({
      company_id,
      user_id: user.id,
      rating,
      title,
      comment: comment || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review }, { status: 201 })
}
