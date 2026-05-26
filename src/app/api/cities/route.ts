import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/cities — list all active cities
export async function GET() {
  const supabase = await createClient()

  const { data: cities, error } = await supabase
    .from("cities")
    .select("id, name, state, slug, is_active")
    .eq("is_active", true)
    .order("name")

  if (error) {
    return NextResponse.json({ error: "Erro ao listar cidades" }, { status: 500 })
  }

  return NextResponse.json({ cities: cities || [] })
}

// POST /api/cities — create new city dynamically
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { name, state } = await request.json()

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Nome da cidade inválido" }, { status: 400 })
  }

  if (!state || state.trim().length !== 2) {
    return NextResponse.json({ error: "Estado inválido (use a sigla com 2 letras)" }, { status: 400 })
  }

  const trimmedName = name.trim()
  const trimmedState = state.trim().toUpperCase()
  const slug = `${trimmedName}-${trimmedState}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // Check if city already exists
  const { data: existing } = await supabase
    .from("cities")
    .select("id, name, state")
    .eq("slug", slug)
    .single()

  if (existing) {
    return NextResponse.json({ city: existing })
  }

  // Create new city
  const { data: city, error } = await supabase
    .from("cities")
    .insert({
      name: trimmedName,
      state: trimmedState,
      slug,
      is_active: true,
    })
    .select("id, name, state")
    .single()

  if (error) {
    if (error.code === "23505") {
      const { data: found } = await supabase
        .from("cities")
        .select("id, name, state")
        .eq("slug", slug)
        .single()
      if (found) return NextResponse.json({ city: found })
    }
    return NextResponse.json({ error: "Erro ao criar cidade" }, { status: 500 })
  }

  return NextResponse.json({ city }, { status: 201 })
}
