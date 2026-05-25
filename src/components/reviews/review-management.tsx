"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface ReviewResponse {
  id: string
  response_text: string
}

interface Review {
  id: string
  rating: number
  title: string
  comment?: string
  created_at: string
  user?: { email: string }
  responses?: ReviewResponse[]
}

interface ReviewManagementProps {
  companyId: string
}

export function ReviewManagement({ companyId }: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [companyId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?company_id=${companyId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          response_text: responseText,
        }),
      })

      if (!res.ok) throw new Error("Erro ao enviar resposta")

      setResponseText("")
      setRespondingTo(null)
      fetchReviews()
    } catch (err) {
      console.error("Erro:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma avaliação ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Gerenciar Avaliações ({reviews.length})</h3>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            {/* Review */}
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold">{review.title}</h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>

            {/* Existing Response */}
            {review.responses && review.responses.length > 0 ? (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200/50 mb-3">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✓ Sua resposta
                </p>
                <p className="text-sm">{review.responses[0].response_text}</p>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mb-3">Sem resposta ainda</div>
            )}

            {/* Response Form */}
            {respondingTo === review.id ? (
              <div className="space-y-3 pt-3 border-t">
                <textarea
                  placeholder="Escreva sua resposta pública..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitResponse(review.id)}
                    disabled={submitting || !responseText.trim()}
                  >
                    {submitting ? "Enviando..." : "Enviar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRespondingTo(null)
                      setResponseText("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRespondingTo(review.id)
                  setResponseText(review.responses?.[0]?.response_text || "")
                }}
              >
                {review.responses && review.responses.length > 0 ? "Editar resposta" : "Responder"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
