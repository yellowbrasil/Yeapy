import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
})

export const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
  companyName: z.string().min(2, "Nome da empresa deve ter no minimo 2 caracteres"),
  slug: z
    .string()
    .min(3, "URL deve ter no minimo 3 caracteres")
    .max(50, "URL deve ter no maximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minusculas, numeros e hifens"),
  whatsapp: z.string().min(10, "WhatsApp invalido").optional().or(z.literal("")),
  cityId: z.string().uuid("Selecione uma cidade").optional().or(z.literal("")),
})

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  description: z.string().max(500, "Descricao deve ter no maximo 500 caracteres").optional().or(z.literal("")),
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
  title: z.string().min(3, "Titulo deve ter no minimo 3 caracteres").max(100, "Titulo muito longo"),
  description: z.string().max(1000, "Descricao muito longa").optional().or(z.literal("")),
  productName: z.string().min(2, "Nome do produto deve ter no minimo 2 caracteres"),
  categoryId: z.string().uuid("Selecione uma categoria"),
  cityId: z.string().uuid("Selecione uma cidade").optional().or(z.literal("")),
  originalPriceCents: z.number().positive("Preco original deve ser positivo"),
  promotionalPriceCents: z.number().positive("Preco promocional deve ser positivo"),
  externalLink: z.string().url("Link invalido").optional().or(z.literal("")),
  whatsappLink: z.string().optional().or(z.literal("")),
  isNational: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
export type OfferInput = z.infer<typeof offerSchema>
