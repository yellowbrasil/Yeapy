import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use PDF, JPG, PNG ou WebP." },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo 10MB." },
      { status: 400 }
    )
  }

  const ext = file.name.split(".").pop() || "pdf"
  const fileName = `${user.id}/documento-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from("documents")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Erro ao enviar documento" }, { status: 500 })
  }

  // Get signed URL (private bucket)
  const { data: urlData } = await admin.storage
    .from("documents")
    .createSignedUrl(data.path, 60 * 60 * 24 * 365) // 1 year

  // Update company with document URL and mark as verified
  await admin
    .from("companies")
    .update({
      documento_url: data.path,
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", user.id)

  return NextResponse.json({
    path: data.path,
    url: urlData?.signedUrl || data.path,
  })
}
