"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    slug: "",
    whatsapp: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 1. Create user + company via server API (bypasses RLS)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          slug: form.slug,
          whatsapp: form.whatsapp,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar. Tente novamente.")
        setLoading(false)
        return
      }

      // 2. Sign in the user on the client
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        // Account created but auto-login failed
        setError("Conta criada! Faça login com seu email e senha.")
        setLoading(false)
        router.push("/login")
        return
      }

      // 3. Redirect to payment page
      router.push("/pagamento")
      router.refresh()
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cadastrar empresa</CardTitle>
        <CardDescription>
          Crie sua conta e comece a publicar ofertas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              placeholder="Minha Empresa"
              value={form.companyName}
              onChange={(e) => {
                updateField("companyName", e.target.value)
                updateField("slug", generateSlug(e.target.value))
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL da empresa</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                yeapy.shop/
              </span>
              <Input
                id="slug"
                placeholder="minha-empresa"
                value={form.slug}
                onChange={(e) =>
                  updateField(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@empresa.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">Celular / WhatsApp *</Label>
            <Input
              id="whatsapp"
              placeholder="(51) 99999-9999"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Usado para contato com clientes nas ofertas
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar empresa"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
