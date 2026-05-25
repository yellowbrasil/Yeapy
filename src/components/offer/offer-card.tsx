"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, ExternalLink, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "./countdown-timer"
import { VerifiedBadge } from "@/components/verification/verified-badge"
import type { OfferWithRelations } from "@/types/database"

interface OfferCardProps {
  offer: OfferWithRelations
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function calcDiscount(original: number, promo: number): number {
  return Math.round(((original - promo) / original) * 100)
}

export function OfferCard({ offer }: OfferCardProps) {
  const discount = calcDiscount(offer.original_price_cents, offer.promotional_price_cents)

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/ofertas/${offer.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {offer.image_url ? (
            <Image
              src={offer.image_url}
              alt={offer.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-white font-bold">
              <ArrowDown className="h-3 w-3 mr-0.5" />
              {discount}%
            </Badge>
          )}

          <div className="absolute top-2 right-2">
            <div className="bg-background/90 backdrop-blur rounded-md px-2 py-1">
              <CountdownTimer expiresAt={offer.expires_at} size="sm" />
            </div>
          </div>
        </div>

        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <span>{offer.company.name}</span>
              <VerifiedBadge isVerified={offer.company.is_verified} size="sm" />
            </div>
            {offer.city && (
              <>
                <span>•</span>
                <MapPin className="h-3 w-3" />
                <span>
                  {offer.city.name}
                </span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {offer.title}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground line-through">
              {formatCents(offer.original_price_cents)}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCents(offer.promotional_price_cents)}
            </span>
          </div>

          <Badge variant="secondary" className="text-xs">
            {offer.category.name}
          </Badge>
        </CardContent>
      </Link>
    </Card>
  )
}
