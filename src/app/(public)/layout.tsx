import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { GlobalSearchBar } from "@/components/layout/search-bar"
import { WebsiteJsonLd } from "@/components/seo/json-ld"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebsiteJsonLd />
      <Navbar />
      <GlobalSearchBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
