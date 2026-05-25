import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createCustomer, findCustomerByEmail, createPaymentLink } from "@/lib/asaas"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: company } = await admin
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
  }

  try {
    // Find or create Asaas customer
    let customerId = user.app_metadata?.asaas_customer_id

    if (!customerId) {
      // Try to find by email
      let customer = await findCustomerByEmail(user.email!)

      if (!customer) {
        // Create new customer
        customer = await createCustomer({
          name: company.name,
          email: user.email!,
          externalReference: user.id,
        })
      }

      customerId = customer.id

      // Save in user metadata
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...user.app_metadata,
          asaas_customer_id: customerId,
        },
      })
    }

    // Create payment link for subscription
    const priceValue = parseFloat(process.env.ASAAS_PRICE_VALUE || "67")

    const paymentLink = await createPaymentLink({
      name: `Assinatura Yeapy — ${company.name}`,
      description: "Assinatura mensal Yeapy — 1 espaço de anúncio ativo",
      value: priceValue,
      billingType: "UNDEFINED", // User chooses: PIX, boleto, or card
      chargeType: "RECURRENT",
      subscriptionCycle: "MONTHLY",
      externalReference: JSON.stringify({
        company_id: company.id,
        user_id: user.id,
        customer_id: customerId,
      }),
      callback: {
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
        autoRedirect: true,
      },
    })

    return NextResponse.json({ url: paymentLink.url })
  } catch (error: any) {
    console.error("Asaas checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar link de pagamento" },
      { status: 500 }
    )
  }
}
