import {
  Flame,
  Clock,
  MapPin,
  TrendingDown,
  ArrowRight,
  Shield,
  Zap,
  Store,
  Eye,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Utensils,
  Laptop,
  Shirt,
  Heart,
  Home,
  Car,
  Dumbbell,
  GraduationCap,
  Wrench,
  PawPrint,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OfferGrid } from "@/components/offer/offer-grid"

const CATEGORY_ICONS: Record<string, any> = {
  alimentacao: Utensils,
  tecnologia: Laptop,
  moda: Shirt,
  saude: Heart,
  casa: Home,
  automotivo: Car,
  esportes: Dumbbell,
  educacao: GraduationCap,
  servicos: Wrench,
  pets: PawPrint,
  beleza: Palette,
  outros: ShoppingBag,
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch active offers
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
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(8)

  // Fetch expiring soon (next 4 hours)
  const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  const { data: expiringSoon } = await supabase
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
    .lte("expires_at", fourHoursFromNow)
    .order("expires_at", { ascending: true })
    .limit(4)

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  // Stats
  const { count: totalOffers } = await supabase
    .from("offers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: totalCompanies } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const activeOffers = offers || []
  const expiringOffers = expiringSoon || []
  const activeCategories = categories || []

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Plataforma de ofertas exclusivas
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Ofertas que expiram em{" "}
            <span className="text-primary relative">
              24 horas
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Descubra oportunidades reais todos os dias. Precos que so diminuem.
            Quando acaba, acaba de verdade.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/busca">
              <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                Ver ofertas ativas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                <Store className="mr-2 h-5 w-5" />
                Cadastrar minha empresa
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {((totalOffers || 0) > 0 || (totalCompanies || 0) > 0) && (
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              {(totalOffers || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span><strong className="text-foreground">{totalOffers}</strong> ofertas ativas</span>
                </div>
              )}
              {(totalCompanies || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span><strong className="text-foreground">{totalCompanies}</strong> empresas</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ofertas reais, com regras que protegem voce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expira em 24h</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toda oferta tem prazo real. Quando o tempo acaba, ela sai do ar automaticamente.
              </p>
              <div className="hidden md:block absolute top-8 -right-4 text-muted-foreground/20">
                <ChevronRight className="h-8 w-8" />
              </div>
            </div>

            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingDown className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Preco so diminui</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se a empresa republicar o produto, o preco tem que ser menor. Sem promocao falsa.
              </p>
              <div className="hidden md:block absolute top-8 -right-4 text-muted-foreground/20">
                <ChevronRight className="h-8 w-8" />
              </div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Local e nacional</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Encontre ofertas da sua cidade ou de todo o Brasil. Voce decide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {activeCategories.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Categorias</h2>
                <p className="text-muted-foreground text-sm">Explore ofertas por segmento</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {activeCategories.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.slug] || ShoppingBag
                return (
                  <Link key={cat.id} href={`/categorias/${cat.slug}`}>
                    <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                      <CardContent className="flex flex-col items-center gap-2 py-5 px-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-center leading-tight">
                          {cat.name}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Expiring Soon */}
      {expiringOffers.length > 0 && (
        <section className="py-16 md:py-20 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Acabando agora</h2>
                  <p className="text-muted-foreground text-sm">Ultimas horas para aproveitar</p>
                </div>
              </div>
              <Link href="/busca?order=expiring">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <OfferGrid offers={expiringOffers as any} />
          </div>
        </section>
      )}

      {/* Latest Offers */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ofertas ativas</h2>
                <p className="text-muted-foreground text-sm">As mais recentes da plataforma</p>
              </div>
            </div>
            <Link href="/busca">
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {activeOffers.length > 0 ? (
            <OfferGrid offers={activeOffers as any} />
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-muted rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma oferta ativa no momento</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                As empresas publicam novas ofertas todos os dias. Volte em breve ou cadastre-se para receber alertas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login">
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Criar conta gratuita
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button>
                    <Store className="mr-2 h-4 w-4" />
                    Publicar minha oferta
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Precos verificados</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Expiracao real</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingDown className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Preco decrescente</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Empresas reais</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Companies */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-16 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Store className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Para empresas</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Publique sua oferta e atraia clientes todos os dias
              </h2>
              <p className="text-background/70 mb-8 text-lg leading-relaxed">
                Cadastre sua empresa, crie ofertas em minutos e alcance milhares de consumidores
                buscando as melhores oportunidades.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/registro">
                  <Button size="lg" className="text-base px-8 h-12 shadow-lg">
                    Comecar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-background/50">
                <span>Cadastro rapido</span>
                <span className="w-1 h-1 rounded-full bg-background/30" />
                <span>Sem burocracia</span>
                <span className="w-1 h-1 rounded-full bg-background/30" />
                <span>Resultados reais</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
