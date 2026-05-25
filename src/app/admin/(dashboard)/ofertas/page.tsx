import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

export const metadata = {
  title: "Ofertas — Admin",
}

export default async function AdminOffersPage() {
  const supabase = createAdminClient()

  const { data: offers } = await supabase
    .from("offers")
    .select("*, company:companies(name, slug), category:categories(name)")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ofertas</h1>

      {offers && offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{offer.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(offer.company as any)?.name} • {(offer.category as any)?.name} •{" "}
                      R$ {(offer.promotional_price_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                  {offer.status === "active" ? "Ativa" : offer.status === "expired" ? "Expirada" : "Cancelada"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma oferta cadastrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
