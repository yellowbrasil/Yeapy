import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Tag, Eye, MapPin, MousePointerClick } from "lucide-react"

export const metadata = {
  title: "Admin — Yeapy",
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [companiesRes, offersActiveRes, offersTotalRes, citiesRes, categoriesRes] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact" }),
    supabase.from("offers").select("id", { count: "exact" }).eq("status", "active"),
    supabase.from("offers").select("id", { count: "exact" }),
    supabase.from("cities").select("id", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
  ])

  // Aggregate views and clicks
  const { data: allOffers } = await supabase
    .from("offers")
    .select("views_count, clicks_count")

  const totalViews = (allOffers || []).reduce((sum, o) => sum + (o.views_count || 0), 0)
  const totalClicks = (allOffers || []).reduce((sum, o) => sum + (o.clicks_count || 0), 0)

  // Recent companies
  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("id, name, slug, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  // Recent offers
  const { data: recentOffers } = await supabase
    .from("offers")
    .select("id, title, status, promotional_price_cents, views_count, clicks_count, created_at, company:companies(name)")
    .order("created_at", { ascending: false })
    .limit(10)

  const stats = {
    companies: companiesRes.count || 0,
    activeOffers: offersActiveRes.count || 0,
    totalOffers: offersTotalRes.count || 0,
    cities: citiesRes.count || 0,
    categories: categoriesRes.count || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <p className="text-sm text-muted-foreground">Visão geral da plataforma Yeapy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Ofertas ativas</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total ofertas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Cidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas empresas</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompanies && recentCompanies.length > 0 ? (
              <div className="space-y-3">
                {recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        yeapy.shop/{company.slug} · {new Date(company.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge
                      variant={company.is_active ? "default" : "secondary"}
                      className={company.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                    >
                      {company.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma empresa cadastrada ainda.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas ofertas</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOffers && recentOffers.length > 0 ? (
              <div className="space-y-3">
                {recentOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{offer.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(offer.company as any)?.name} · R${(offer.promotional_price_cents / 100).toFixed(2)} · {offer.views_count || 0} views
                      </p>
                    </div>
                    <Badge
                      variant={offer.status === "active" ? "default" : "secondary"}
                      className={offer.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100 ml-2" : "ml-2"}
                    >
                      {offer.status === "active" ? "Ativa" : offer.status === "expired" ? "Expirada" : "Cancelada"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma oferta cadastrada ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
