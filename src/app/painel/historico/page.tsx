import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown } from "lucide-react"

export const metadata = {
  title: "Historico",
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!company) redirect("/registro")

  const { data: products } = await supabase
    .from("products")
    .select("*, offer_history(promotional_price_cents, original_price_cents, created_at)")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historico de precos</h1>
        <p className="text-muted-foreground text-sm">
          Veja o historico de precos dos seus produtos.
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <Badge variant="secondary">
                    {product.total_offers} {product.total_offers === 1 ? "oferta" : "ofertas"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {product.lowest_price_cents && (
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-primary" />
                      Menor: R$ {(product.lowest_price_cents / 100).toFixed(2)}
                    </span>
                  )}
                  {product.last_offer_price_cents && (
                    <span>
                      Ultimo: R$ {(product.last_offer_price_cents / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(product as any).offer_history && (product as any).offer_history.length > 0 ? (
                  <div className="space-y-2">
                    {(product as any).offer_history.map((h: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                        <span className="text-muted-foreground">
                          {new Date(h.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground">
                            R$ {(h.original_price_cents / 100).toFixed(2)}
                          </span>
                          <span className="font-medium text-primary">
                            R$ {(h.promotional_price_cents / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem historico.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum produto cadastrado ainda. Crie sua primeira oferta!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
