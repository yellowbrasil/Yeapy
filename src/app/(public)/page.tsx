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
import Image from "next/image"
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

const MAX_CATEGORIES_HOME = 12
const MAX_OFFERS_HOME = 30

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch active offers (max 30)
  const { data: offers } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp, is_verified),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(MAX_OFFERS_HOME)

  // Fetch expiring soon (next 4 hours)
  const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  const { data: expiringSoon } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp, is_verified),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .lte("expires_at", fourHoursFromNow)
    .order("expires_at", { ascending: true })
    .limit(4)

  // Fetch top 12 categories (by sort_order, which represents relevance/popularity)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(MAX_CATEGORIES_HOME)

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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-8 md:py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Image
            src="/images/logo.png"
            alt="Yeapy"
            width={280}
            height={93}
            className="mx-auto mb-3"
            priority
          />

          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Ofertas relâmpago de 24 horas
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Ofertas que expiram em{" "}
            <span className="text-primary relative">
              24 horas
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
              </svg>
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Descubra oportunidades reais todos os dias. Preços que só diminuem.
            Quando acaba, acaba de verdade.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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
            <div className="flex items-center justify-center gap-8 text-xs md:text-sm text-muted-foreground">
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

      {/* Banner */}
      <section className="container mx-auto px-4 -mt-4 mb-8">
        <div className="relative w-full rounded-2xl overflow-hidden">
          {/* Desktop banner */}
          <Image
            src="/images/banner-desktop.png"
            alt="Yeapy — Ofertas relâmpago de 24 horas"
            width={1200}
            height={300}
            className="w-full h-auto hidden md:block rounded-2xl"
            priority
          />
          {/* Mobile banner */}
          <Image
            src="/images/banner-mobile.png"
            alt="Yeapy — Ofertas relâmpago de 24 horas"
            width={800}
            height={200}
            className="w-full h-auto md:hidden rounded-2xl"
            priority
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ofertas reais, com regras que protegem você
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
              <h3 className="font-semibold text-lg mb-2">Preço só diminui</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se a empresa republicar o produto, o preço tem que ser menor. Sem promoção falsa.
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
                Encontre ofertas da sua cidade ou de todo o Brasil. Você decide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories (max 12) */}
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
                  <p className="text-muted-foreground text-sm">Últimas horas para aproveitar</p>
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

      {/* Latest Offers (max 30) */}
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
                As empresas publicam novas ofertas todos os dias. Volte em breve ou cadastre-se para publicar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              <span className="text-sm font-medium">Preços verificados</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Expiração real</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingDown className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Preço decrescente</span>
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
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-background/50">
                <span>Cadastro rápido</span>
                <span className="w-1 h-1 rounded-full bg-background/30" />
                <span>Sem burocracia</span>
                <span className="w-1 h-1 rounded-full bg-background/30" />
                <span>Resultados reais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zero comissão + Igualdade + Integração */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sem comissão */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/50 p-8 text-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                Zero comissão sobre vendas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A Yeapy não cobra percentual nem comissão pelas suas vendas.
                O lucro é <strong className="text-foreground">100% seu</strong>.
                Pague apenas o plano mensal e venda direto para o cliente.
              </p>
            </div>

            {/* Igualdade */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/50 p-8 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                Vitrine igual para todos
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pequenos e grandes anunciantes têm o mesmo destaque e espaço.
                Aqui, o que importa é a <strong className="text-foreground">qualidade da sua oferta</strong> —
                e não o tamanho da empresa. Compita de igual para igual.
              </p>
            </div>

            {/* Integração Online + Física */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/50 p-8 text-center">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                Integração lojas online e físicas
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A Yeapy é a <strong className="text-foreground">única plataforma que integra</strong> lojas online e físicas.
                Poupe tempo dos clientes em buscas de produtos e crie um novo ecossistema de compra.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
