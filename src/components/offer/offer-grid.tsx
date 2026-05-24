import { OfferCard } from "./offer-card"
import type { OfferWithRelations } from "@/types/database"

interface OfferGridProps {
  offers: OfferWithRelations[]
  emptyMessage?: string
}

export function OfferGrid({ offers, emptyMessage = "Nenhuma oferta encontrada." }: OfferGridProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}
