import { z } from "zod"

// Auth
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
})

// Offers
export const createOfferSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000),
  price: z.number().positive("Preço deve ser maior que 0"),
  category_id: z.string().uuid(),
  city_id: z.string().uuid(),
  image_url: z.string().url().optional(),
})

// Reviews
export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5).max(1000),
  company_id: z.string().uuid(),
})

// Verification
export const verificationUploadSchema = z.object({
  company_id: z.string().uuid(),
  document_type: z.enum(["cnpj", "cpf", "business_license"]),
})

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}
