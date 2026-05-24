import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
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
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
