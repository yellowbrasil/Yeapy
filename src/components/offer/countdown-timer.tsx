"use client"

import { useCountdown } from "@/hooks/use-countdown"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  expiresAt: string
  size?: "sm" | "md" | "lg"
}

export function CountdownTimer({ expiresAt, size = "md" }: CountdownTimerProps) {
  const { hours, minutes, seconds, isExpired, formatted } = useCountdown(expiresAt)

  const isUrgent = !isExpired && hours < 2

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Encerrada</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono font-bold",
        isUrgent ? "text-destructive" : "text-primary",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-2xl"
      )}
    >
      <Clock className={cn("shrink-0", size === "lg" ? "h-6 w-6" : "h-4 w-4")} />
      <div className="flex items-center gap-0.5">
        <TimeBlock value={hours} label="h" size={size} />
        <span className={cn(isUrgent && "animate-pulse")}>:</span>
        <TimeBlock value={minutes} label="m" size={size} />
        <span className={cn(isUrgent && "animate-pulse")}>:</span>
        <TimeBlock value={seconds} label="s" size={size} />
      </div>
    </div>
  )
}

function TimeBlock({
  value,
  label,
  size,
}: {
  value: number
  label: string
  size: "sm" | "md" | "lg"
}) {
  return (
    <span className={cn(size === "lg" && "bg-foreground/5 rounded px-2 py-1")}>
      {String(value).padStart(2, "0")}
    </span>
  )
}
