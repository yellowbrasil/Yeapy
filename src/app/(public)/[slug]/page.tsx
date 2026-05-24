import { ArrowLeft, MapPin, Phone, Globe, MessageCircle, Store, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { OfferGrid } from "@/components/offer/offer-grid"
import { LocalBusinessJsonLd } from "@/components/seo/json-ld"
import type { Metadata } from "next"

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: company } = await supabase
    .from("companies")
    .select("name, description, logo_url")
    .eq("slug", slug)
    .single()

  if (!company) return { title: "Empresa nao encontrada" }

  return {
    title: company.name,
    description: company.description || `Veja as ofertas de ${company.name} na Yeapy.`,
    openGraph: {
      title: company.name,
      description: company.description || undefined,
      images: company.logo_url ? [company.logo_url] : undefined,
    },
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from("companies")
    .select(`
      *,
      city:cities(id, name, state, slug)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!company) notFound()

  // Active offers
  const { data: activeOffers } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("company_id", company.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(12)

  // Expired offers (history)
  const { data: expiredOffers } = await supabase
    .from("offers")
    .select(`
      *,
      company:companies(id, name, slug, logo_url, whatsapp),
      category:categories(id, name, slug),
      city:cities(id, name, state, slug),
      product:products(id, name, lowest_price_cents, total_offers)
    `)
    .eq("company_id", company.id)
    .eq("status", "expired")
    .order("created_at", { ascending: false })
    .limit(8)

  const city = company.city as any
  const socialLinks = (company.social_links as any) || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <LocalBusinessJsonLd
        name={company.name}
        description={company.description || undefined}
        url={`https://yeapy.shop/${company.slug}`}
        address={company.address || undefined}
        phone={company.phone || undefined}
        image={company.logo_url || undefined}
      />

      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-4 text-center">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <Store className="h-8 w-8 text-primary" />
                </div>
              )}

              <div>
                <h1 className="text-xl font-bold">{company.name}</h1>
                {company.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {company.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-left">
                {city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{city.name}, {city.state}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {socialLinks.site && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a
                      href={socialLinks.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground truncate"
                    >
                      {socialLinks.site.replace(/https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {company.whatsapp && (
                <a
                  href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Ofertas ativas</h2>
            {(activeOffers || []).length > 0 ? (
              <OfferGrid offers={(activeOffers || []) as any} />
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-2xl">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma oferta ativa desta empresa no momento.
                </p>
              </div>
            )}
          </div>

          {(expiredOffers || []).length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Ofertas anteriores</h2>
              <div className="opacity-60">
                <OfferGrid offers={(expiredOffers || []) as any} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
