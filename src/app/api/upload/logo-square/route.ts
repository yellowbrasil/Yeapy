import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/png", "image/jpeg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas PNG e JPEG são permitidos" },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máximo 5MB)" },
        { status: 400 }
      )
    }

    // Verificar se empresa existe
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Upload para Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${company.id}-square-${Date.now()}.${fileExt}`
    const filePath = `logos-square/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("logos")
      .upload(filePath, Buffer.from(arrayBuffer), {
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Erro ao fazer upload: " + uploadError.message },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath)

    return NextResponse.json({ path: publicUrl }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
