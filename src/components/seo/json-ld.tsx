interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Yeapy",
        url: "https://yeapy.shop",
        description: "Plataforma de ofertas temporárias de 24 horas. Descubra oportunidades reais todos os dias.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://yeapy.shop/busca?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}

export function OfferJsonLd({
  name,
  description,
  price,
  originalPrice,
  image,
  url,
  seller,
  validThrough,
}: {
  name: string
  description: string
  price: number
  originalPrice: number
  image?: string
  url: string
  seller: string
  validThrough: string
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Offer",
        name,
        description,
        price: (price / 100).toFixed(2),
        priceCurrency: "BRL",
        priceValidUntil: validThrough,
        availability: "https://schema.org/InStock",
        url,
        image,
        seller: {
          "@type": "Organization",
          name: seller,
        },
        offers: {
          "@type": "AggregateOffer",
          lowPrice: (price / 100).toFixed(2),
          highPrice: (originalPrice / 100).toFixed(2),
          priceCurrency: "BRL",
        },
      }}
    />
  )
}

export function LocalBusinessJsonLd({
  name,
  description,
  url,
  address,
  phone,
  image,
}: {
  name: string
  description?: string
  url: string
  address?: string
  phone?: string
  image?: string
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
        description,
        url,
        image,
        telephone: phone,
        address: address
          ? {
              "@type": "PostalAddress",
              streetAddress: address,
              addressCountry: "BR",
            }
          : undefined,
      }}
    />
  )
}
