export const APP_NAME = "Yeapy"
export const APP_DESCRIPTION = "Ofertas temporárias com prazo de 24 horas. Descubra oportunidades reais todos os dias."
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const OFFER_DURATION_HOURS = 24

export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

export const PLAN_LIMITS = {
  basico: { maxOffers: 3 },
  profissional: { maxOffers: 10 },
  premium: { maxOffers: 30 },
} as const
