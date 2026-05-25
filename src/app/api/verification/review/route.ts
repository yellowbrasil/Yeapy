import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Verificar se é admin
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const isAdmin = authUser?.app_metadata?.role === "admin"

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Você não tem permissão para revisar documentos" },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { company_id, approved, rejection_reason } = body

  if (!company_id) {
    return NextResponse.json({ error: "company_id é obrigatório" }, { status: 400 })
  }

  try {
    // Buscar documentos pendentes da empresa
    const { data: documents } = await supabase
      .from("company_verification_documents")
      .select("*")
      .eq("company_id", company_id)
      .eq("status", "pending")

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "Nenhum documento pendente encontrado" },
        { status: 404 }
      )
    }

    const newStatus = approved ? "approved" : "rejected"

    // Atualizar status dos documentos
    await supabase
      .from("company_verification_documents")
      .update({
        status: newStatus,
        rejection_reason: !approved ? rejection_reason : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("company_id", company_id)
      .eq("status", "pending")

    // Atualizar status de verificação da empresa
    await supabase
      .from("companies")
      .update({
        is_verified: approved,
        verification_status: approved ? "approved" : "rejected",
        verification_rejected_reason: !approved ? rejection_reason : null,
        verification_reviewed_at: new Date().toISOString(),
      })
      .eq("id", company_id)

    return NextResponse.json(
      {
        message: approved ? "Empresa verificada com sucesso" : "Documentos rejeitados",
        approved,
      },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao revisar documentos" },
      { status: 500 }
    )
  }
}
