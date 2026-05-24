import { MetadataRoute } from "next"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const baseUrl = "https://yeapy.shop"

  // Paginas estaticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "always", priority: 1 },
    { url: `${baseUrl}/busca`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ]

  // Categorias
  const { data: categories } = await supabase.from("categories").select("slug").eq("is_active", true)
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${baseUrl}/categorias/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  // Cidades
  const { data: cities } = await supabase.from("cities").select("slug").eq("is_active", true)
  const cityPages: MetadataRoute.Sitemap = (cities || []).map((city) => ({
    url: `${baseUrl}/cidades/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  // Empresas ativas
  const { data: companies } = await supabase.from("companies").select("slug").eq("is_active", true)
  const companyPages: MetadataRoute.Sitemap = (companies || []).map((company) => ({
    url: `${baseUrl}/${company.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }))

  // Ofertas ativas
  const { data: offers } = await supabase.from("offers").select("id, created_at").eq("status", "active")
  const offerPages: MetadataRoute.Sitemap = (offers || []).map((offer) => ({
    url: `${baseUrl}/ofertas/${offer.id}`,
    lastModified: new Date(offer.created_at),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...cityPages, ...companyPages, ...offerPages]
}
