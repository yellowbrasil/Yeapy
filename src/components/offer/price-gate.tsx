"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PriceGateProps {
  isLoggedIn: boolean
  originalPriceCents: number
  promotionalPriceCents: number
  discount: number
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function PriceGate({
  isLoggedIn,
  originalPriceCents,
  promotionalPriceCents,
  discount,
}: PriceGateProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-muted-foreground line-through">
          {formatCents(originalPriceCents)}
        </span>
        <span className="text-lg font-bold text-primary">
          {formatCents(promotionalPriceCents)}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="text-lg font-bold text-transparent select-none bg-muted rounded px-4 py-0.5">
            R$ 00,00
          </span>
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-muted/60 rounded">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {discount > 0 && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>
      <Link href="/login?redirect=/">
        <Button variant="outline" size="sm" className="w-full text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Cadastre-se grátis para ver o preço
        </Button>
      </Link>
    </div>
  )
}
