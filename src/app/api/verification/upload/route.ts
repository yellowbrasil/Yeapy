import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // Verificar se é proprietário
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json(
      { error: "Você não é proprietário de uma empresa" },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validações
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use PDF, PNG ou JPEG" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      )
    }

    // Upload para Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${company.id}/${Date.now()}.${fileExt}`

    const { data, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file, { upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName)

    // Registrar documento no banco
    const { data: document, error: dbError } = await supabase
      .from("company_verification_documents")
      .insert({
        company_id: company.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: fileExt,
        file_size: file.size,
        status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Atualizar status de submissão na empresa
    await supabase
      .from("companies")
      .update({
        verification_status: "pending",
        verification_submitted_at: new Date().toISOString(),
      })
      .eq("id", company.id)

    return NextResponse.json({ document }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
