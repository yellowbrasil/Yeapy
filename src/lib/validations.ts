import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  companyName: z.string().min(2, "Nome da empresa deve ter no mínimo 2 caracteres"),
  slug: z
    .string()
    .min(3, "URL deve ter no mínimo 3 caracteres")
    .max(50, "URL deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minúsculas, números e hífens"),
  whatsapp: z.string().min(10, "WhatsApp inválido").optional().or(z.literal("")),
  cityId: z.string().uuid("Selecione uma cidade").optional().or(z.literal("")),
})

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  cityId: z.string().uuid().optional().or(z.literal("")),
  state: z.string().max(2).optional().or(z.literal("")),
  socialLinks: z
    .object({
      instagram: z.string().optional().or(z.literal("")),
      facebook: z.string().optional().or(z.literal("")),
      site: z.string().optional().or(z.literal("")),
    })
    .optional(),
})

export const offerSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  productName: z.string().min(2, "Nome do produto deve ter no mínimo 2 caracteres"),
  categoryId: z.string().uuid("Selecione uma categoria"),
  cityId: z.string().uuid("Selecione uma cidade").optional().or(z.literal("")),
  originalPriceCents: z.number().positive("Preço original deve ser positivo"),
  promotionalPriceCents: z.number().positive("Preço promocional deve ser positivo"),
  externalLink: z.string().url("Link inválido").optional().or(z.literal("")),
  whatsappLink: z.string().optional().or(z.literal("")),
  isNational: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
export type OfferInput = z.infer<typeof offerSchema>
