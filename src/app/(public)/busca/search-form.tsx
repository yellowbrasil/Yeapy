"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchFormProps {
  initialQuery: string
  initialCategory: string
  initialCity: string
  initialOrder: string
  categories: { id: string; name: string; slug: string }[]
  cities: { id: string; name: string; slug: string; state: string }[]
}

export function SearchForm({
  initialQuery,
  initialCategory,
  initialCity,
  initialOrder,
  categories,
  cities,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [showFilters, setShowFilters] = useState(
    !!(initialCategory || initialCity)
  )
  const router = useRouter()

  function buildUrl(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams()
    const q = overrides.q ?? query
    const cat = overrides.category ?? initialCategory
    const city = overrides.city ?? initialCity
    const order = overrides.order ?? initialOrder

    if (q) params.set("q", q)
    if (cat) params.set("category", cat)
    if (city) params.set("city", city)
    if (order && order !== "recent") params.set("order", order)

    const qs = params.toString()
    return `/busca${qs ? `?${qs}` : ""}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl())
  }

  function handleOrderChange(value: string) {
    router.push(buildUrl({ order: value }))
  }

  function handleCategoryChange(slug: string) {
    router.push(buildUrl({ category: slug === initialCategory ? "" : slug }))
  }

  function handleCityChange(value: string) {
    router.push(buildUrl({ city: value === "all" ? "" : value }))
  }

  function clearFilters() {
    router.push("/busca")
  }

  const hasFilters = !!(initialCategory || initialCity || initialQuery)

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="O que você procura? Ex: pizza, notebook, academia..."
            className="pl-10 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="h-11 px-6">
          Buscar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/30 rounded-xl border">
          <Select
            value={initialCity || "all"}
            onValueChange={(val) => val && handleCityChange(val)}
          >
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name} - {c.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={initialOrder}
            onValueChange={(val) => val && handleOrderChange(val)}
          >
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="expiring">Acabando em breve</SelectItem>
              <SelectItem value="discount">Menor preço</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={cat.slug === initialCategory ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => handleCategoryChange(cat.slug)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
