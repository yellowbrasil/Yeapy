import { Navbar } from "@/components/layout/navbar"
import { PainelSidebar } from "@/components/layout/painel-sidebar"

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <PainelSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  )
}
