import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/painel/", "/admin/", "/api/"],
      },
    ],
    sitemap: "https://yeapy.shop/sitemap.xml",
  }
}
