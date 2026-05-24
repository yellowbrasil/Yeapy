"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, MessageCircle } from "lucide-react"

interface TrackedButtonProps {
  offerId: string
  companyId: string
  clickType: "whatsapp" | "external_link" | "view"
  href: string
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
}

export function TrackedButton({
  offerId,
  companyId,
  clickType,
  href,
  children,
  className,
  variant,
}: TrackedButtonProps) {
  async function handleClick() {
    // Registrar clique em background
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId,
        companyId,
        clickType,
      }),
    }).catch(() => {}) // silencioso

    // Abrir link
    window.open(href, "_blank", "noopener,noreferrer")
  }

  const isWhatsapp = clickType === "whatsapp"

  if (!children) {
    const defaultLabel = isWhatsapp ? "Chamar no WhatsApp" : "Acessar oferta"
    const Icon = isWhatsapp ? MessageCircle : ExternalLink
    children = (
      <>
        <Icon className="h-4 w-4 mr-2" />
        {defaultLabel}
      </>
    )
  }

  return (
    <Button
      onClick={handleClick}
      size="lg"
      variant={variant}
      className={className}
    >
      {children}
    </Button>
  )
}
