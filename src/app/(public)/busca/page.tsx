import { Search, SlidersHorizontal, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { OfferGrid } from "@/components/offer/offer-grid"
import { SearchForm } from "./search-form"
import Link from "next/link"

export const metadata = {
  title: "Buscar ofertas",
  description: "Busque por produtos, servicos e ofertas em tempo real na Yeapy.",
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string; order?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const category = params.category || ""
  const city = params.city || ""
  const order = params.order || "recent"

  const supabase = await createClient()

  // Build query
  let dbQuery = supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())

  // Text search
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  // Category filter
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single()
    if (cat) {
      dbQuery = dbQuery.eq("category_id", cat.id)
    }
  }

  // City filter
  if (city) {
    const { data: cit } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", city)
      .single()
    if (cit) {
      dbQuery = dbQuery.eq("city_id", cit.id)
    }
  }

  // Ordering
  if (order === "expiring") {
    dbQuery = dbQuery.order("expires_at", { ascending: true })
  } else if (order === "discount") {
    dbQuery = dbQuery.order("promotional_price_cents", { ascending: true })
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false })
  }

  const { data: offers } = await dbQuery.limit(24)

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  // Fetch cities for filter
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name, slug, state")
    .eq("is_active", true)
    .order("name", { ascending: true })

  const activeOffers = offers || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Buscar ofertas</h1>
        <p className="text-muted-foreground">
          {query
            ? `Resultados para "${query}"`
            : "Encontre as melhores ofertas de 24 horas"
          }
        </p>
      </div>

      <SearchForm
        initialQuery={query}
        initialCategory={category}
        initialCity={city}
        initialOrder={order}
        categories={categories || []}
        cities={cities || []}
      />

      {/* Results */}
      <div className="mt-8">
        {activeOffers.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {activeOffers.length} oferta{activeOffers.length !== 1 ? "s" : ""} encontrada{activeOffers.length !== 1 ? "s" : ""}
          </p>
        )}

        {activeOffers.length > 0 ? (
          <OfferGrid offers={activeOffers as any} />
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-muted rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {query ? "Nenhuma oferta encontrada" : "Nenhuma oferta ativa no momento"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {query
                ? "Tente buscar com outros termos ou remova os filtros."
                : "As empresas publicam novas ofertas todos os dias. Volte em breve!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
