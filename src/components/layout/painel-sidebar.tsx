"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Tag, Clock, UserCircle, LogOut, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const sidebarLinks = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/painel/ofertas", label: "Minhas ofertas", icon: Tag },
  { href: "/painel/historico", label: "Historico", icon: Clock },
  { href: "/painel/perfil", label: "Perfil da empresa", icon: UserCircle },
]

export function PainelSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)] hidden md:block">
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Painel da Empresa</span>
        </div>
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
        <hr className="my-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
