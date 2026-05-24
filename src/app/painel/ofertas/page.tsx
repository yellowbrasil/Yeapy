import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Minhas ofertas",
}

export default async function OffersListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!company) redirect("/registro")

  const { data: offers } = await supabase
    .from("offers")
    .select("*, category:categories(name), city:cities(name, state)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas ofertas</h1>
        <Link href="/painel/ofertas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova oferta
          </Button>
        </Link>
      </div>

      {offers && offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-lg">
                    {offer.image_url ? "🖼️" : "📦"}
                  </div>
                  <div>
                    <p className="font-medium">{offer.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>
                        R$ {(offer.promotional_price_cents / 100).toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>{(offer.category as any)?.name}</span>
                      {(offer.city as any) && (
                        <>
                          <span>•</span>
                          <span>{(offer.city as any).name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge
                      variant={offer.status === "active" ? "default" : "secondary"}
                    >
                      {offer.status === "active" ? "Ativa" : "Encerrada"}
                    </Badge>
                    {offer.status === "active" && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(offer.expires_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Voce ainda nao tem ofertas cadastradas.
            </p>
            <Link href="/painel/ofertas/nova">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira oferta
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
