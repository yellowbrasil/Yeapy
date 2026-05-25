import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, AlertCircle } from "lucide-react"
import Image from "next/image"
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
    .select("id, profile_complete")
    .eq("owner_id", user.id)
    .single()

  if (!company) redirect("/registro")

  const { data: offers } = await supabase
    .from("offers")
    .select("*, category:categories(name), city:cities(name, state), images")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      {!company.profile_complete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Complete seu perfil para anunciar</p>
            <p className="mt-1">
              Antes de publicar ofertas, preencha os dados obrigatórios da empresa:
              Razão Social, nome do responsável, endereço completo com CEP e WhatsApp.
            </p>
            <Link href="/painel/perfil">
              <Button size="sm" variant="outline" className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100">
                Completar perfil
              </Button>
            </Link>
          </div>
        </div>
      )}

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
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-lg overflow-hidden relative">
                    {offer.image_url ? (
                      <Image
                        src={offer.image_url}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>📦</span>
                    )}
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
              Você ainda não tem ofertas cadastradas.
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
