import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tag, Eye, Clock, Plus, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Painel",
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  if (!company) redirect("/registro")

  // Metrics
  const { count: activeOffers } = await supabase
    .from("offers")
    .select("id", { count: "exact" })
    .eq("company_id", company.id)
    .eq("status", "active")

  const { count: totalOffers } = await supabase
    .from("offers")
    .select("id", { count: "exact" })
    .eq("company_id", company.id)

  // Aggregate views and clicks from all offers
  const { data: offerStats } = await supabase
    .from("offers")
    .select("views_count, clicks_count")
    .eq("company_id", company.id)

  const totalViews = (offerStats || []).reduce((sum, o) => sum + (o.views_count || 0), 0)
  const totalClicks = (offerStats || []).reduce((sum, o) => sum + (o.clicks_count || 0), 0)

  // Recent offers
  const { data: recentOffers } = await supabase
    .from("offers")
    .select("id, title, status, promotional_price_cents, original_price_cents, expires_at, views_count, clicks_count, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Click count from offer_clicks table (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentClicks } = await supabase
    .from("offer_clicks")
    .select("id", { count: "exact" })
    .eq("company_id", company.id)
    .gte("created_at", thirtyDaysAgo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, {company.name}</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie suas ofertas e acompanhe o desempenho.
          </p>
        </div>
        <Link href="/painel/ofertas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova oferta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas ativas</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOffers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {totalOffers || 0} no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              em todas as ofertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              WhatsApp + links externos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interações 30d</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentClicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Offers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Ofertas recentes</CardTitle>
          <Link href="/painel/ofertas">
            <Button variant="ghost" size="sm">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOffers && recentOffers.length > 0 ? (
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{offer.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatCents(offer.promotional_price_cents)}</span>
                      <span>{offer.views_count || 0} views</span>
                      <span>{offer.clicks_count || 0} cliques</span>
                    </div>
                  </div>
                  <Badge
                    variant={offer.status === "active" ? "default" : "secondary"}
                    className={offer.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    {offer.status === "active" ? "Ativa" : offer.status === "expired" ? "Encerrada" : "Cancelada"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">
                Nenhuma oferta cadastrada ainda.
              </p>
              <Link href="/painel/ofertas/nova">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira oferta
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
