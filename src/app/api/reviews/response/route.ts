import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { review_id, response_text } = body

  if (!review_id || !response_text) {
    return NextResponse.json(
      { error: "review_id e response_text são obrigatórios" },
      { status: 400 }
    )
  }

  // Verificar se o usuário é proprietário da empresa
  const { data: review } = await supabase
    .from("company_reviews")
    .select("company_id")
    .eq("id", review_id)
    .single()

  if (!review) {
    return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 })
  }

  const { data: company } = await supabase
    .from("companies")
    .select("owner_id")
    .eq("id", review.company_id)
    .single()

  if (!company || company.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Você não tem permissão para responder avaliações desta empresa" },
      { status: 403 }
    )
  }

  // Remover resposta anterior se existir
  await supabase
    .from("company_review_responses")
    .delete()
    .eq("review_id", review_id)

  // Criar nova resposta
  const { data: response, error } = await supabase
    .from("company_review_responses")
    .insert({
      review_id,
      company_id: review.company_id,
      response_text,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ response }, { status: 201 })
}
