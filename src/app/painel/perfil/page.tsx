"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    state: "",
    instagram: "",
    facebook: "",
    site: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .single()
      if (data) {
        setForm({
          name: data.name || "",
          description: data.description || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "",
          state: data.state || "",
          instagram: (data.social_links as any)?.instagram || "",
          facebook: (data.social_links as any)?.facebook || "",
          site: (data.social_links as any)?.site || "",
        })
      }
    })
  }, [])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        state: form.state,
        socialLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
          site: form.site,
        },
      }),
    })

    setLoading(false)
    if (res.ok) setSaved(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Perfil da empresa</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informacoes gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {saved && (
              <div className="bg-green-50 text-green-700 text-sm rounded-md p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Perfil atualizado com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome da empresa</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Conte um pouco sobre sua empresa..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(51) 3333-3333"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="(51) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Rua, numero, bairro..."
              />
            </div>

            <div className="space-y-2">
              <Label>Redes sociais</Label>
              <Input
                placeholder="@instagram"
                value={form.instagram}
                onChange={(e) => updateField("instagram", e.target.value)}
              />
              <Input
                placeholder="facebook.com/pagina"
                value={form.facebook}
                onChange={(e) => updateField("facebook", e.target.value)}
              />
              <Input
                placeholder="https://www.seusite.com.br"
                value={form.site}
                onChange={(e) => updateField("site", e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
