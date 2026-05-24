"use client"

import { useState, useEffect } from "react"

interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  formatted: string
}

export function useCountdown(expiresAt: string): CountdownResult {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      const result = calculateTimeLeft(expiresAt)
      setTimeLeft(result)
      if (result.isExpired) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  return timeLeft
}

function calculateTimeLeft(expiresAt: string): CountdownResult {
  const diff = new Date(expiresAt).getTime() - Date.now()

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "Encerrada" }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return { hours, minutes, seconds, isExpired: false, formatted }
}
