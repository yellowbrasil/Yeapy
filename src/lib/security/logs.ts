import { createAdminClient } from "@/lib/supabase/admin"

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "register"
  | "offer_created"
  | "offer_deleted"
  | "offer_updated"
  | "review_created"
  | "review_deleted"
  | "payment_started"
  | "payment_completed"
  | "payment_failed"
  | "company_verified"
  | "document_uploaded"
  | "rate_limit_exceeded"
  | "suspicious_activity"

export async function logSecurityEvent(
  eventType: SecurityEventType,
  userId: string | null,
  companyId: string | null,
  details: Record<string, any>,
  ipAddress: string | null = null
) {
  try {
    const admin = createAdminClient()

    await admin.from("security_logs").insert({
      event_type: eventType,
      user_id: userId,
      company_id: companyId,
      ip_address: ipAddress,
      details,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro ao registrar log de segurança:", error)
  }
}

export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress: string | null,
  reason?: string
) {
  await logSecurityEvent(
    success ? "login_success" : "login_failed",
    null,
    null,
    {
      email,
      reason: reason || (success ? "Login bem-sucedido" : "Credenciais inválidas"),
    },
    ipAddress
  )
}

export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string,
  activity: string
) {
  // Exemplo: mesmo usuário com 3 IPs diferentes em 5 minutos
  const admin = createAdminClient()

  const { data: recentLogins } = await admin
    .from("security_logs")
    .select("ip_address")
    .eq("user_id", userId)
    .eq("event_type", "login_success")
    .gt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())

  const uniqueIps = new Set(recentLogins?.map((log) => log.ip_address) || [])

  if (uniqueIps.size > 2) {
    await logSecurityEvent(
      "suspicious_activity",
      userId,
      null,
      {
        activity,
        uniqueIps: Array.from(uniqueIps).length,
        ipAddress,
      },
      ipAddress
    )
  }
}
