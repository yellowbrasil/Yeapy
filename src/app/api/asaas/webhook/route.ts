import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateAsaasWebhook, getWebhookPayload } from "@/lib/security/webhook"
import { logSecurityEvent } from "@/lib/security/logs"

// Asaas webhook events
// PAYMENT_CONFIRMED — pagamento confirmado (PIX, boleto, cartão)
// PAYMENT_RECEIVED — pagamento recebido
// PAYMENT_OVERDUE — pagamento em atraso
// PAYMENT_DELETED — pagamento deletado
// PAYMENT_REFUNDED — pagamento estornado
// SUBSCRIPTION_DELETED — assinatura cancelada

export async function POST(request: NextRequest) {
  // Get webhook payload and signature
  const { payload, signature } = await getWebhookPayload(request)

  // Verify webhook signature
  const signatureValidation = validateAsaasWebhook(payload, signature)
  if (!signatureValidation.valid) {
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    await logSecurityEvent(
      "webhook_signature_invalid",
      null,
      null,
      { error: signatureValidation.error, service: "asaas" },
      ipAddress
    )
    return NextResponse.json({ error: signatureValidation.error }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const { event, payment, subscription } = body

  const admin = createAdminClient()

  try {
    switch (event) {
      // Payment confirmed or received — activate company
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        if (!payment) break

        // Try to get company reference from payment or subscription
        let companyId: string | null = null
        let userId: string | null = null

        // externalReference can be in payment or subscription
        const ref = payment.externalReference || payment.subscription?.externalReference
        if (ref) {
          try {
            const parsed = JSON.parse(ref)
            companyId = parsed.company_id
            userId = parsed.user_id
          } catch {
            // externalReference might not be JSON
          }
        }

        // Fallback: find by customer email
        if (!companyId && payment.customer) {
          const customerEmail = payment.customer?.email || payment.customerEmail
          if (customerEmail) {
            const { data: users } = await admin.auth.admin.listUsers()
            const matchedUser = users?.users?.find(u => u.email === customerEmail)
            if (matchedUser) {
              userId = matchedUser.id
              const { data: company } = await admin
                .from("companies")
                .select("id")
                .eq("owner_id", matchedUser.id)
                .single()
              if (company) companyId = company.id
            }
          }
        }

        if (companyId) {
          await admin
            .from("companies")
            .update({
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", companyId)

          // Save subscription ID in user metadata
          if (userId && payment.subscription) {
            const { data: { user } } = await admin.auth.admin.getUserById(userId)
            if (user) {
              await admin.auth.admin.updateUserById(userId, {
                app_metadata: {
                  ...user.app_metadata,
                  asaas_subscription_id: payment.subscription,
                },
              })
            }
          }
        }
        break
      }

      // Payment overdue — deactivate company
      case "PAYMENT_OVERDUE": {
        if (!payment) break

        const ref = payment.externalReference || payment.subscription?.externalReference
        if (ref) {
          try {
            const parsed = JSON.parse(ref)
            if (parsed.company_id) {
              await admin
                .from("companies")
                .update({
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", parsed.company_id)
            }
          } catch {}
        }
        break
      }

      // Payment refunded — deactivate company
      case "PAYMENT_REFUNDED":
      case "PAYMENT_DELETED": {
        if (!payment) break

        const ref = payment.externalReference || payment.subscription?.externalReference
        if (ref) {
          try {
            const parsed = JSON.parse(ref)
            if (parsed.company_id) {
              await admin
                .from("companies")
                .update({
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", parsed.company_id)

              // Cancel active offers
              await admin
                .from("offers")
                .update({ status: "cancelled" })
                .eq("company_id", parsed.company_id)
                .eq("status", "active")
            }
          } catch {}
        }
        break
      }

      // Subscription cancelled — deactivate company + cancel offers
      case "SUBSCRIPTION_DELETED": {
        if (!subscription) break

        const ref = subscription.externalReference
        if (ref) {
          try {
            const parsed = JSON.parse(ref)
            if (parsed.company_id) {
              await admin
                .from("companies")
                .update({
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", parsed.company_id)

              await admin
                .from("offers")
                .update({ status: "cancelled" })
                .eq("company_id", parsed.company_id)
                .eq("status", "active")
            }
          } catch {}
        }
        break
      }
    }
  } catch (error) {
    console.error("Asaas webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
