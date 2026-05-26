import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateCsrfToken, storeCsrfToken } from "@/lib/security/csrf"
import { addCorsHeaders } from "@/lib/security/cors"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const response = NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    return addCorsHeaders(response)
  }

  const token = generateCsrfToken()
  storeCsrfToken(user.id, token)

  const response = NextResponse.json({ csrfToken: token }, { status: 200 })
  return addCorsHeaders(response)
}
