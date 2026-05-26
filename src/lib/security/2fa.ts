import speakeasy from "speakeasy"
import QRCode from "qrcode"

export async function generateTwoFactorSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Yeapy (${email})`,
    issuer: "Yeapy",
    length: 32,
  })

  // Gerar QR code como string base64
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes(),
  }
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Aceita token de +/- 2 períodos (mais flexível)
    })

    return verified
  } catch (error) {
    console.error("Erro ao verificar 2FA:", error)
    return false
  }
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }

  return codes
}

export function validateBackupCode(providedCode: string, storedCodes: string[]): boolean {
  return storedCodes.includes(providedCode.toUpperCase())
}
