"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageSquare } from "lucide-react"

interface ReviewResponse {
  id: string
  response_text: string
  created_at: string
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

interface ReviewListProps {
  companyId: string
}

export function ReviewList({ companyId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchReviews()
  }, [companyId])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando avaliações...</div>
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma avaliação ainda</p>
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-4xl font-bold">{averageRating}</div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(Number(averageRating))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Avaliações</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold">{review.title}</h4>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {new Date(review.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>
              )}

              {/* Response */}
              {review.responses && review.responses.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg mt-4 border-l-4 border-primary">
                  <p className="text-xs font-semibold text-primary mb-2">Resposta da empresa</p>
                  <p className="text-sm">{review.responses[0].response_text}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.responses[0].created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
