import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/categories — list all active categories
export async function GET() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, is_active")
    .eq("is_active", true)
    .order("name")

  if (error) {
    return NextResponse.json({ error: "Erro ao listar categorias" }, { status: 500 })
  }

  return NextResponse.json({ categories: categories || [] })
}

// POST /api/categories — create new category dynamically
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { name } = await request.json()

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Nome da categoria inválido" }, { status: 400 })
  }

  const trimmedName = name.trim()
  const slug = trimmedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // Check if category already exists
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (existing) {
    return NextResponse.json({ category: existing })
  }

  // Create new category
  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: trimmedName,
      slug,
      is_active: true,
    })
    .select("id, name")
    .single()

  if (error) {
    // If slug conflict, return existing
    if (error.code === "23505") {
      const { data: found } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", slug)
        .single()
      if (found) return NextResponse.json({ category: found })
    }
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }

  return NextResponse.json({ category }, { status: 201 })
}
