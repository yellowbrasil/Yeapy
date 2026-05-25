import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ReviewManagement } from "@/components/reviews/review-management"
import { MessageSquare } from "lucide-react"

export const metadata = {
  title: "Avaliações — Painel Yeapy",
}

export default async function AvaliacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .single()

  if (!company) redirect("/registro")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Avaliações da sua empresa</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe e responda as avaliações públicas dos clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{company.name}</CardTitle>
              <CardDescription>Gerenciar avaliações e respostas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReviewManagement companyId={company.id} />
        </CardContent>
      </Card>
    </div>
  )
}
