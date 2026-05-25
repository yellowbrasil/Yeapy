"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Shield, Zap, Clock, QrCode, Barcode } from "lucide-react"

export default function PagamentoPage() {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/asaas/checkout", { method: "POST" })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Erro ao iniciar pagamento. Tente novamente.")
        setLoading(false)
      }
    } catch {
      alert("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Ative sua conta</h1>
          <p className="text-muted-foreground">
            Falta só o pagamento para começar a publicar ofertas
          </p>
        </div>

        {/* Plan Card */}
        <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Promo banner */}
          <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm font-semibold">
            PROMOÇÃO DE LANÇAMENTO
          </div>

          <CardHeader className="text-center pb-2 pt-6">
            <Badge className="w-fit mx-auto mb-3" variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Oferta por tempo limitado
            </Badge>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl text-muted-foreground/60 line-through">R$97</span>
              <div>
                <span className="text-5xl font-bold tracking-tight">R$67</span>
                <span className="text-lg text-muted-foreground">/mês</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              por anúncio ativo · cancele quando quiser
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Benefits */}
            <ul className="space-y-3">
              {[
                "1 espaço de oferta ativa por vez",
                "Ofertas válidas por 24 horas com renovação contínua",
                "Página exclusiva da empresa",
                "Painel com cliques, views e histórico",
                "Nota fiscal emitida automaticamente",
                "Suporte por WhatsApp",
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              size="lg"
              className="w-full text-base h-13"
            >
              {loading ? (
                "Redirecionando..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Assinar agora — R$67/mês
                </>
              )}
            </Button>

            {/* Payment methods */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" /> PIX
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Cartão
              </span>
              <span className="flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5" /> Boleto
              </span>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Pagamento seguro
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Ativa em segundos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Extra info */}
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Como funciona?</strong> Após o pagamento, sua empresa é ativada
            automaticamente e você pode publicar ofertas imediatamente.
          </p>
          <p>
            <strong>Nota fiscal</strong> é emitida automaticamente após a confirmação
            do pagamento.
          </p>
          <p>
            <strong>Quer mais anúncios?</strong> Cada anúncio adicional custa R$67/mês.
            Gerencie tudo pelo painel.
          </p>
        </div>
      </div>
    </div>
  )
}
