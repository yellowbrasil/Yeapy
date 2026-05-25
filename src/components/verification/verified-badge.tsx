import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface VerifiedBadgeProps {
  isVerified: boolean
  size?: "sm" | "md"
}

export function VerifiedBadge({ isVerified, size = "sm" }: VerifiedBadgeProps) {
  if (!isVerified) return null

  return (
    <Badge className="bg-blue-600 hover:bg-blue-700">
      <CheckCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
      Verificada
    </Badge>
  )
}
