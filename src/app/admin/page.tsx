import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Tag, Eye, Users } from "lucide-react"

export const metadata = {
  title: "Admin",
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [companiesRes, offersActiveRes, offersTotalRes, citiesRes] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact" }),
    supabase.from("offers").select("id", { count: "exact" }).eq("status", "active"),
    supabase.from("offers").select("id", { count: "exact" }),
    supabase.from("cities").select("id", { count: "exact" }),
  ])

  const stats = {
    companies: companiesRes.count || 0,
    activeOffers: offersActiveRes.count || 0,
    totalOffers: offersTotalRes.count || 0,
    cities: citiesRes.count || 0,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas ativas</CardTitle>
            <Tag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeOffers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de ofertas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOffers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidades</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.cities}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas empresas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma empresa cadastrada ainda.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
