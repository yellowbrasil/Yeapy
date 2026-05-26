import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  "https://yeapy.shop",
  "https://www.yeapy.shop",
]

export function addCorsHeaders(response: NextResponse): NextResponse {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://yeapy.shop"

  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Max-Age", "86400")
  response.headers.set("Access-Control-Allow-Credentials", "true")

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export function handleCorsPreFlight() {
  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response)
}
