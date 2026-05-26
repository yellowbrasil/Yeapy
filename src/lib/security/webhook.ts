import crypto from "crypto"
import { NextRequest } from "next/server"

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("Erro ao verificar assinatura de webhook:", error)
    return false
  }
}

export function getAsaasWebhookSecret(): string {
  const secret = process.env.ASAAS_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("ASAAS_WEBHOOK_SECRET não está configurado")
  }

  return secret
}

export async function getWebhookPayload(request: NextRequest): Promise<{ payload: string; signature: string | null }> {
  const signature = request.headers.get("asaas-signature") || request.headers.get("x-asaas-signature")

  const payload = await request.text()

  return { payload, signature }
}

export function validateAsaasWebhook(
  payload: string,
  signature: string | null
): { valid: boolean; error?: string } {
  if (!signature) {
    return {
      valid: false,
      error: "Assinatura de webhook não encontrada",
    }
  }

  try {
    const secret = getAsaasWebhookSecret()
    const isValid = verifyWebhookSignature(payload, signature, secret)

    if (!isValid) {
      return {
        valid: false,
        error: "Assinatura de webhook inválida",
      }
    }

    return { valid: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return {
      valid: false,
      error: `Erro ao validar webhook: ${message}`,
    }
  }
}
