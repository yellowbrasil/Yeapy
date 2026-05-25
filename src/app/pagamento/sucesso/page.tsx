import { CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Pagamento confirmado",
}

export default function PagamentoSucessoPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Pagamento confirmado!</h1>
            <p className="text-muted-foreground">
              Sua empresa está ativa. Agora você pode publicar suas ofertas
              e começar a vender mais.
            </p>
          </div>

          <Link href="/painel">
            <Button size="lg" className="w-full">
              Ir para o painel
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground">
            Você receberá um email com os detalhes da sua assinatura.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
