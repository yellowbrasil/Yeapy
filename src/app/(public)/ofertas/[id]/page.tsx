import { ArrowLeft, MapPin, ExternalLink, TrendingDown, Store, MessageCircle, Share2, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CountdownTimer } from "@/components/offer/countdown-timer"
import { TrackedButton } from "@/components/offer/tracked-button"
import { PriceGate } from "@/components/offer/price-gate"
import { OfferJsonLd } from "@/components/seo/json-ld"
import type { Metadata } from "next"

interface OfferPageProps {
  params: Promise<{ id: string }>
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: offer } = await supabase
    .from("offers")
    .select("title, description, image_url, promotional_price_cents")
    .eq("id", id)
    .single()

  if (!offer) return { title: "Oferta nao encontrada" }

  return {
    title: offer.title,
    description: offer.description || `Oferta com preco especial na Yeapy.`,
    openGraph: {
      title: offer.title,
      description: offer.description || undefined,
      images: offer.image_url ? [offer.image_url] : undefined,
    },
  }
}

export default async function OfferDetailPage({ params }: OfferPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: offer } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp, description, address, city_id),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("id", id)
    .single()

  if (!offer) notFound()

  // Fetch price history
  const { data: history } = await supabase
    .from("offer_history")
    .select("promotional_price_cents, original_price_cents, created_at")
    .eq("product_id", offer.product_id)
    .eq("company_id", offer.company_id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const discount = Math.round(
    ((offer.original_price_cents - offer.promotional_price_cents) / offer.original_price_cents) * 100
  )

  const company = offer.company as any
  const category = offer.category as any
  const city = offer.city as any
  const product = offer.product as any
  const priceHistory = history || []

  return (
    <div className="container mx-auto px-4 py-8">
      <OfferJsonLd
        name={offer.title}
        description={offer.description || ""}
        price={offer.promotional_price_cents}
        originalPrice={offer.original_price_cents}
        image={offer.image_url || undefined}
        url={`https://yeapy.shop/ofertas/${offer.id}`}
        seller={company.name}
        validThrough={offer.expires_at}
      />

      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para ofertas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
            {offer.image_url ? (
              <Image
                src={offer.image_url}
                alt={offer.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl">📦</span>
              </div>
            )}

            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-white font-bold text-base px-3 py-1">
                <ArrowDown className="h-4 w-4 mr-1" />
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Title & meta */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{category.name}</Badge>
              {offer.is_national && <Badge variant="outline">Nacional</Badge>}
              {offer.status === "expired" && (
                <Badge variant="destructive">Encerrada</Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              {offer.title}
            </h1>

            {city && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{city.name}, {city.state}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {offer.description && (
            <div className="prose prose-sm max-w-none">
              <h2 className="text-lg font-semibold mb-2">Sobre esta oferta</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {offer.description}
              </p>
            </div>
          )}

          {/* Price History */}
          {priceHistory.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  Historico de precos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceHistory.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCents(entry.original_price_cents)}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCents(entry.promotional_price_cents)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {product.total_offers > 1 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Menor preco ja registrado: {formatCents(product.lowest_price_cents || offer.promotional_price_cents)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-4">
          {/* Price & CTA card */}
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-5">
              {/* Countdown */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expira em</span>
                <CountdownTimer expiresAt={offer.expires_at} size="md" />
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <PriceGate
                  isLoggedIn={isLoggedIn}
                  originalPriceCents={offer.original_price_cents}
                  promotionalPriceCents={offer.promotional_price_cents}
                  discount={discount}
                />
              </div>

              {/* Action buttons */}
              {isLoggedIn && offer.status === "active" && (
                <div className="space-y-2 border-t pt-4">
                  {offer.whatsapp_link && (
                    <TrackedButton
                      offerId={offer.id}
                      companyId={offer.company_id}
                      clickType="whatsapp"
                      href={offer.whatsapp_link}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chamar no WhatsApp
                    </TrackedButton>
                  )}

                  {offer.external_link && (
                    <TrackedButton
                      offerId={offer.id}
                      companyId={offer.company_id}
                      clickType="external_link"
                      href={offer.external_link}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver no site da empresa
                    </TrackedButton>
                  )}
                </div>
              )}

              {/* Views */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>{offer.views_count || 0} visualizacoes</span>
                <span>{offer.clicks_count || 0} cliques</span>
              </div>
            </CardContent>
          </Card>

          {/* Company card */}
          <Card>
            <CardContent className="p-4">
              <Link href={`/${company.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{company.name}</p>
                  <p className="text-xs text-muted-foreground">Ver perfil da empresa</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
