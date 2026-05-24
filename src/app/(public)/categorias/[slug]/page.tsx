import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OfferGrid } from "@/components/offer/offer-grid"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single()

  return {
    title: category ? `Ofertas de ${category.name}` : "Categoria",
    description: category
      ? `Encontre as melhores ofertas de ${category.name} com desconto e expiracao em 24 horas.`
      : undefined,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!category) notFound()

  const { data: offers } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("status", "active")
    .eq("category_id", category.id)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(24)

  const activeOffers = offers || []

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {category.name}
        </h1>
        <p className="text-muted-foreground">
          Ofertas ativas na categoria {category.name}
        </p>
      </div>

      {activeOffers.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {activeOffers.length} oferta{activeOffers.length !== 1 ? "s" : ""} ativa{activeOffers.length !== 1 ? "s" : ""}
          </p>
          <OfferGrid offers={activeOffers as any} />
        </>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-muted rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma oferta ativa nesta categoria
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Novas ofertas sao publicadas diariamente. Volte em breve!
          </p>
        </div>
      )}
    </div>
  )
}
