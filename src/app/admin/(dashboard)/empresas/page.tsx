import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"

export const metadata = {
  title: "Empresas — Admin",
}

export default async function AdminCompaniesPage() {
  const supabase = createAdminClient()

  const { data: companies } = await supabase
    .from("companies")
    .select("*, city:cities(name, state), plan:plans(name)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Empresas</h1>

      {companies && companies.length > 0 ? (
        <div className="space-y-3">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      yeapy.shop/{company.slug}
                      {(company.city as any) && ` • ${(company.city as any).name}/${(company.city as any).state}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(company.plan as any) && (
                    <Badge variant="secondary">{(company.plan as any).name}</Badge>
                  )}
                  <Badge variant={company.is_active ? "default" : "secondary"}>
                    {company.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                  {company.is_verified && (
                    <Badge className="bg-green-100 text-green-700">Verificada</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma empresa cadastrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
