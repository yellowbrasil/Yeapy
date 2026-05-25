const ASAAS_API_URL = process.env.ASAAS_SANDBOX === "true"
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3"

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY
  if (!key) throw new Error("ASAAS_API_KEY is not configured")
  return key
}

export async function asaasRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${ASAAS_API_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Asaas API error:", JSON.stringify(data))
    throw new Error(data.errors?.[0]?.description || "Erro na API Asaas")
  }

  return data
}

// ---- Customers ----

export async function createCustomer(params: {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
  externalReference?: string
}) {
  return asaasRequest("/customers", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function findCustomerByEmail(email: string) {
  const data = await asaasRequest(`/customers?email=${encodeURIComponent(email)}`)
  return data.data?.[0] || null
}

// ---- Subscriptions ----

export async function createSubscription(params: {
  customer: string
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED"
  value: number
  cycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY"
  description?: string
  externalReference?: string
}) {
  return asaasRequest("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      nextDueDate: new Date().toISOString().split("T")[0],
    }),
  })
}

// ---- Payment Links ----

export async function createPaymentLink(params: {
  name: string
  description?: string
  value: number
  billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "PIX"
  chargeType: "DETACHED" | "RECURRENT" | "INSTALLMENT"
  subscriptionCycle?: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY"
  maxInstallmentCount?: number
  externalReference?: string
  callback?: {
    successUrl: string
    autoRedirect?: boolean
  }
}) {
  return asaasRequest("/paymentLinks", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

// ---- Invoices (NFS-e) ----

export async function configureInvoice(params: {
  municipalServiceId?: string
  municipalServiceCode?: string
  municipalServiceName?: string
  deductions?: number
  effectiveDatePeriod?: "ON_PAYMENT_CONFIRMATION" | "ON_DUE_DATE" | "BEFORE_DUE_DATE"
  receivedOnly?: boolean
  observations?: string
  taxes?: {
    retainIss?: boolean
    iss?: number
    cofins?: number
    csll?: number
    inss?: number
    ir?: number
    pis?: number
  }
}) {
  return asaasRequest("/invoices/setting", {
    method: "POST",
    body: JSON.stringify(params),
  })
}
