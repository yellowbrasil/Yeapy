"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, X, ImagePlus, Loader2, Info, Plus, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

const MAX_IMAGES = 3

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
]

export default function NewOfferPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [profileComplete, setProfileComplete] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])

  // Dynamic creation states
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [showNewCity, setShowNewCity] = useState(false)
  const [newCityName, setNewCityName] = useState("")
  const [newCityState, setNewCityState] = useState("")
  const [creatingCity, setCreatingCity] = useState(false)

  // Delivery areas
  const [deliveryArea, setDeliveryArea] = useState("")

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
    deliveryAreas: [] as string[],
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
      supabase.from("cities").select("id, name, state").eq("is_active", true).order("name"),
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return null
        const { data } = await supabase
          .from("companies")
          .select("profile_complete, whatsapp")
          .eq("owner_id", user.id)
          .single()
        return data
      }),
    ]).then(([catRes, cityRes, companyData]) => {
      setCategories(catRes.data || [])
      setCities(cityRes.data || [])
      if (companyData && !companyData.profile_complete) {
        setProfileComplete(false)
      }
      // Pre-fill WhatsApp from company
      if (companyData?.whatsapp) {
        setForm(prev => ({ ...prev, whatsappLink: companyData.whatsapp }))
      }
    })
  }, [])

  function updateField(field: string, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      const data = await res.json()
      if (data.category) {
        // Add to list if not already there
        setCategories(prev => {
          const exists = prev.find(c => c.id === data.category.id)
          return exists ? prev : [...prev, data.category]
        })
        updateField("categoryId", data.category.id)
        setShowNewCategory(false)
        setNewCategoryName("")
      }
    } catch {
      setError("Erro ao criar categoria")
    }
    setCreatingCategory(false)
  }

  async function handleCreateCity() {
    if (!newCityName.trim() || !newCityState.trim()) return
    setCreatingCity(true)

    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCityName.trim(), state: newCityState.trim() }),
      })
      const data = await res.json()
      if (data.city) {
        setCities(prev => {
          const exists = prev.find(c => c.id === data.city.id)
          return exists ? prev : [...prev, data.city]
        })
        updateField("cityId", data.city.id)
        setShowNewCity(false)
        setNewCityName("")
        setNewCityState("")
      }
    } catch {
      setError("Erro ao criar cidade")
    }
    setCreatingCity(false)
  }

  function addDeliveryArea() {
    if (!deliveryArea.trim()) return
    const area = deliveryArea.trim()
    if (!form.deliveryAreas.includes(area)) {
      updateField("deliveryAreas", [...form.deliveryAreas, area])
    }
    setDeliveryArea("")
  }

  function removeDeliveryArea(index: number) {
    updateField("deliveryAreas", form.deliveryAreas.filter((_, i) => i !== index))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`Limite de ${MAX_IMAGES} imagens atingido.`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    setError("")

    for (const file of filesToUpload) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Formato não suportado. Use JPG, PNG ou WebP.")
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Imagem muito grande. Máximo 5MB por imagem.")
        continue
      }

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Erro ao enviar imagem.")
          continue
        }

        const data = await res.json()
        setImages((prev) => [...prev, data.url])
      } catch {
        setError("Erro de conexão ao enviar imagem.")
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.whatsappLink) {
      setError("WhatsApp é obrigatório para publicar ofertas.")
      return
    }

    setLoading(true)

    const originalPriceCents = Math.round(parseFloat(form.originalPrice) * 100)
    const promotionalPriceCents = Math.round(parseFloat(form.promotionalPrice) * 100)

    if (promotionalPriceCents >= originalPriceCents) {
      setError("O preço promocional deve ser menor que o preço original.")
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
        imageUrl: images[0] || null,
        images: images,
        deliveryAreas: form.deliveryAreas,
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

  if (!profileComplete) {
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
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">Complete seu perfil primeiro</h2>
            <p className="text-muted-foreground">
              Antes de publicar ofertas, você precisa preencher os dados da empresa:
              Razão Social, nome do responsável, endereço completo com CEP e WhatsApp.
            </p>
            <Link href="/painel/perfil">
              <Button size="lg">Completar perfil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            A oferta ficará ativa por 24 horas e expirará automaticamente.
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

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Fotos da oferta (até {MAX_IMAGES})</Label>
              <div className="flex flex-wrap gap-3">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted group"
                  >
                    <Image
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] text-center py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px]">Adicionar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP. Máximo 5MB por imagem. A primeira será a foto principal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Nome do produto/serviço</Label>
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
                Se você já anunciou este produto antes, o novo preço deve ser menor.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título da oferta</Label>
              <Input
                id="title"
                placeholder="Ex: Pizza Grande Margherita por apenas R$ 29,90"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
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
                <Label htmlFor="originalPrice">Preço original (R$)</Label>
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
                <Label htmlFor="promotionalPrice">Preço promocional (R$)</Label>
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

            {/* Category with dynamic creation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categoria</Label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Nova categoria
                </button>
              </div>

              {showNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                  >
                    {creatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowNewCategory(false); setNewCategoryName("") }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* City with dynamic creation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cidade</Label>
                <button
                  type="button"
                  onClick={() => setShowNewCity(!showNewCity)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Nova cidade
                </button>
              </div>

              {showNewCity ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da cidade"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="UF"
                    value={newCityState}
                    onChange={(e) => setNewCityState(e.target.value.toUpperCase().slice(0, 2))}
                    className="w-16"
                    maxLength={2}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCity}
                    disabled={creatingCity}
                  >
                    {creatingCity ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowNewCity(false); setNewCityName(""); setNewCityState("") }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <select
                  value={form.cityId}
                  onChange={(e) => updateField("cityId", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione a cidade...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name} - {city.state}</option>
                  ))}
                </select>
              )}
            </div>

            {/* WhatsApp - obrigatório */}
            <div className="space-y-2">
              <Label htmlFor="whatsappLink">WhatsApp para contato *</Label>
              <Input
                id="whatsappLink"
                placeholder="5551999999999"
                value={form.whatsappLink}
                onChange={(e) => updateField("whatsappLink", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: código do país + DDD + número (sem espaços). Os clientes vão entrar em contato por aqui.
              </p>
            </div>

            {/* Link externo - opcional */}
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

            {/* Local vs Nacional */}
            <div className="space-y-3">
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

              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg p-3 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Local vs Nacional:</p>
                  <p className="mt-0.5">
                    <strong>Oferta local:</strong> para empresas que vendem ou atendem apenas em cidades/regiões específicas.
                    Selecione sua cidade acima.
                  </p>
                  <p className="mt-1">
                    <strong>Oferta nacional:</strong> somente para quem entrega em todo o Brasil (ex: e-commerce, serviços online).
                    Se você vende localmente, não marque esta opção.
                  </p>
                </div>
              </div>
            </div>

            {/* Areas de entrega */}
            <div className="space-y-2">
              <Label>Áreas de entrega (opcional)</Label>
              <p className="text-xs text-muted-foreground">
                Informe as cidades ou estados onde você entrega. Ex: "Porto Alegre", "RS", "Grande SP"
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Porto Alegre, RS, Grande SP..."
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addDeliveryArea()
                    }
                  }}
                />
                <Button type="button" size="sm" variant="outline" onClick={addDeliveryArea}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.deliveryAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.deliveryAreas.map((area, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {area}
                      <button type="button" onClick={() => removeDeliveryArea(i)}>
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || uploading}>
              {loading ? "Publicando..." : "Publicar oferta (24h)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
