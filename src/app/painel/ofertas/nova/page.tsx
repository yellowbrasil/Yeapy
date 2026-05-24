"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    productName: "",
    categoryId: "",
    cityId: "",
    originalPrice: "",
    promotionalPrice: "",
    externalLink: "",
    whatsappLink: "",
    isNational: false,
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
      supabase.from("cities").select("id, name, state").eq("is_active", true).order("name"),
    ]).then(([catRes, cityRes]) => {
      setCategories(catRes.data || [])
      setCities(cityRes.data || [])
    })
  }, [])

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const originalPriceCents = Math.round(parseFloat(form.originalPrice) * 100)
    const promotionalPriceCents = Math.round(parseFloat(form.promotionalPrice) * 100)

    if (promotionalPriceCents >= originalPriceCents) {
      setError("O preco promocional deve ser menor que o preco original.")
      setLoading(false)
      return
    }

    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        productName: form.productName,
        categoryId: form.categoryId,
        cityId: form.cityId || null,
        originalPriceCents,
        promotionalPriceCents,
        externalLink: form.externalLink,
        whatsappLink: form.whatsappLink,
        isNational: form.isNational,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao criar oferta.")
      setLoading(false)
      return
    }

    router.push("/painel/ofertas")
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/painel/ofertas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para ofertas
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nova oferta</CardTitle>
          <CardDescription>
            A oferta ficara ativa por 24 horas e expirara automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="productName">Nome do produto/servico</Label>
              <Input
                id="productName"
                placeholder="Ex: Pizza Grande Margherita"
                value={form.productName}
                onChange={(e) => {
                  updateField("productName", e.target.value)
                  if (!form.title) updateField("title", e.target.value)
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                Se voce ja anunciou este produto antes, o novo preco deve ser menor.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titulo da oferta</Label>
              <Input
                id="title"
                placeholder="Ex: Pizza Grande Margherita por apenas R$ 29,90"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Detalhes sobre a oferta..."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Preco original (R$)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="99.90"
                  value={form.originalPrice}
                  onChange={(e) => updateField("originalPrice", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionalPrice">Preco promocional (R$)</Label>
                <Input
                  id="promotionalPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="49.90"
                  value={form.promotionalPrice}
                  onChange={(e) => updateField("promotionalPrice", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) => val && updateField("categoryId", val)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select
                  value={form.cityId}
                  onValueChange={(val) => val && updateField("cityId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nacional" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} - {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalLink">Link externo (opcional)</Label>
              <Input
                id="externalLink"
                type="url"
                placeholder="https://www.mercadolivre.com.br/produto..."
                value={form.externalLink}
                onChange={(e) => updateField("externalLink", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappLink">Numero WhatsApp (opcional)</Label>
              <Input
                id="whatsappLink"
                placeholder="5551999999999"
                value={form.whatsappLink}
                onChange={(e) => updateField("whatsappLink", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Formato: codigo do pais + DDD + numero (sem espacos)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNational"
                checked={form.isNational}
                onChange={(e) => updateField("isNational", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isNational" className="text-sm font-normal">
                Oferta nacional (entrega para todo Brasil)
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Publicando..." : "Publicar oferta (24h)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
