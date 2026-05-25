"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, MapPin, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function GlobalSearchBar() {
  const [query, setQuery] = useState("")
  const [citySlug, setCitySlug] = useState("")
  const [cities, setCities] = useState<{ id: string; name: string; slug: string; state: string }[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on panel/admin pages
  const hiddenPaths = ["/painel", "/admin", "/login", "/registro", "/esqueci-senha", "/redefinir-senha", "/pagamento"]
  const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p))

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("cities")
      .select("id, name, slug, state")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCities(data || []))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (citySlug === "nacional") {
      params.set("national", "true")
    } else if (citySlug) {
      params.set("city", citySlug)
    }
    const qs = params.toString()
    router.push(`/busca${qs ? `?${qs}` : ""}`)
  }

  if (shouldHide) return null

  return (
    <div className="bg-muted/40 border-b">
      <div className="container mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="O que você procura? Ex: pizza, notebook, academia..."
              className="pl-10 h-10 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="relative sm:w-52">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <select
              value={citySlug}
              onChange={(e) => setCitySlug(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todas as cidades</option>
              <option value="nacional">🌐 Ofertas nacionais</option>
              {cities.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} - {c.state}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="h-10 px-6">
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
