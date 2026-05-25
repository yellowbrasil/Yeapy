"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Upload, Shield, AlertCircle, FileText, Loader2 } from "lucide-react"
import { VerificationUpload } from "@/components/verification/verification-upload"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [company, setCompany] = useState<any>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    state: "",
    cep: "",
    razaoSocial: "",
    responsavelNome: "",
    instagram: "",
    facebook: "",
    site: "",
    logoSquareUrl: "",
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
        setCompany(data)
        setForm({
          name: data.name || "",
          description: data.description || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "",
          state: data.state || "",
          cep: data.cep || "",
          razaoSocial: data.razao_social || "",
          responsavelNome: data.responsavel_nome || "",
          instagram: (data.social_links as any)?.instagram || "",
          facebook: (data.social_links as any)?.facebook || "",
          site: (data.social_links as any)?.site || "",
          logoSquareUrl: data.logo_square_url || "",
        })
      }
    })
  }, [])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar documento")
      } else {
        setCompany((prev: any) => ({ ...prev, documento_url: data.path, is_verified: true }))
        setSaved(false)
      }
    } catch {
      setError("Erro de conexão ao enviar documento")
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleLogoSquareUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload/logo-square", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar logo")
      } else {
        setForm((prev) => ({ ...prev, logoSquareUrl: data.path }))
        setSaved(false)
      }
    } catch {
      setError("Erro de conexão ao enviar logo")
    }

    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

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
        cep: form.cep,
        razaoSocial: form.razaoSocial,
        responsavelNome: form.responsavelNome,
        logoSquareUrl: form.logoSquareUrl,
        socialLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
          site: form.site,
        },
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSaved(true)
      const data = await res.json()
      setCompany(data.company)
    } else {
      setError("Erro ao salvar. Tente novamente.")
    }
  }

  const isProfileComplete = form.razaoSocial && form.responsavelNome && form.address && form.cep && form.whatsapp

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil da empresa</h1>
        {company?.is_verified && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Shield className="h-3 w-3 mr-1" />
            Empresa verificada
          </Badge>
        )}
      </div>

      {!isProfileComplete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Complete seu perfil para anunciar</p>
            <p className="mt-1">
              Antes de publicar ofertas, preencha os dados obrigatórios:
              Razão Social, nome do responsável, endereço completo com CEP e WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Dados internos (não aparecem no anúncio) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da empresa</CardTitle>
          <CardDescription>
            Informações internas para emissão de nota fiscal. Não aparecem nos anúncios públicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {saved && (
              <div className="bg-green-50 text-green-700 text-sm rounded-md p-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Perfil atualizado com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                value={form.razaoSocial}
                onChange={(e) => updateField("razaoSocial", e.target.value)}
                placeholder="Empresa LTDA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavelNome">Nome do responsável *</Label>
              <Input
                id="responsavelNome"
                value={form.responsavelNome}
                onChange={(e) => updateField("responsavelNome", e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome fantasia</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Conte um pouco sobre sua empresa..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço completo *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={(e) => updateField("cep", e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="RS"
                  maxLength={2}
                />
              </div>
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
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="(51) 99999-9999"
                  required
                />
              </div>
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
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logo Quadrada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo Quadrada (1:1)</CardTitle>
          <CardDescription>
            Upload de logo em formato quadrado para exibição em cards de ofertas e displays compactos.
            Formatos: PNG, JPG, JPEG. Máximo 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company?.logo_square_url && (
            <div className="flex items-center gap-4">
              <Image
                src={company.logo_square_url}
                alt="Logo quadrada"
                width={100}
                height={100}
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, logoSquareUrl: "" }))}
                className="text-sm text-destructive hover:text-destructive/80"
              >
                Remover
              </button>
            </div>
          )}
          <div
            onClick={() => !uploading && document.getElementById("logo-square-input")?.click()}
            className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Enviando logo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium">Clique para enviar logo quadrada</p>
                <p className="text-xs">PNG, JPG ou JPEG. Máximo 5MB.</p>
              </div>
            )}
          </div>
          <input
            id="logo-square-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleLogoSquareUpload}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>

      {/* Documento / Verificacao */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verificação da empresa
          </CardTitle>
          <CardDescription>
            Envie uma cópia do contrato social ou cartão CNPJ para receber o selo de empresa verificada.
            Este documento é confidencial e não será exibido publicamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company?.is_verified ? (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Empresa verificada!</p>
                <p>Seu selo de empresa verificada está ativo e visível nos seus anúncios.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Enviando documento...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p className="text-sm font-medium">Clique para enviar documento</p>
                    <p className="text-xs">PDF, JPG, PNG ou WebP. Máximo 10MB.</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </div>
          )}

          {company?.documento_url && !company?.is_verified && (
            <p className="text-sm text-muted-foreground">
              Documento enviado. A verificação será processada em breve.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Verificação de Empresa */}
      {company && (
        <VerificationUpload
          companyId={company.id}
          isVerified={company.is_verified}
          verificationStatus={company.verification_status}
        />
      )}
    </div>
  )
}
