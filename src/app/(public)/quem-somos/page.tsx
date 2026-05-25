import { Clock, Zap, TrendingDown, Shield, Store, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quem Somos — Yeapy",
  description: "A Yeapy é um portal de anúncios com ofertas relâmpago válidas por apenas 24 horas.",
}

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-16 pb-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Image
            src="/images/logo.png"
            alt="Yeapy"
            width={510}
            height={171}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Quem somos
          </h1>
          <p className="text-lg text-muted-foreground">
            Ofertas reais. Tempo limitado. Oportunidades todos os dias.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/80 leading-relaxed">
            <p>
              A Yeapy é um portal de anúncios com ofertas relâmpago válidas por apenas 24 horas.
              Após esse período, as ofertas expiram automaticamente, criando um ambiente dinâmico
              de oportunidades reais e temporárias.
            </p>

            <p>
              Empresas podem divulgar diariamente produtos ou serviços com preços promocionais e
              direcionar os clientes diretamente para WhatsApp, e-commerce, delivery, site próprio
              ou qualquer plataforma de venda.
            </p>

            <p>
              O consumidor acessa a plataforma para descobrir oportunidades antes que acabem. As
              ofertas possuem tempo limitado, contador regressivo e atualização constante,
              incentivando o acesso diário para acompanhar novas promoções.
            </p>

            <p className="font-semibold text-foreground">
              Na Yeapy, o foco não é manter anúncios eternos, mas sim criar urgência, recorrência
              e descoberta de oportunidades em tempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Por que a Yeapy é diferente?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">24 horas</h3>
              <p className="text-sm text-muted-foreground">
                Ofertas com prazo real. Quando acaba, sai do ar automaticamente.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Preço decrescente</h3>
              <p className="text-sm text-muted-foreground">
                Se o produto voltar, o preço tem que ser menor. Sem promoção falsa.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Urgência real</h3>
              <p className="text-sm text-muted-foreground">
                Contador regressivo e atualização constante incentivam o acesso diário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-muted/50 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Transparência e responsabilidade</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toda responsabilidade sobre os anúncios publicados é exclusivamente do anunciante,
              incluindo textos, imagens, preços, ofertas, condições comerciais, estoque, entrega,
              atendimento, garantia, qualidade dos produtos ou serviços, veracidade das informações
              e cumprimento das ofertas divulgadas.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Yeapy atua apenas como plataforma de divulgação e conexão entre empresas e
              consumidores, não participando das negociações, pagamentos, entregas ou transações
              realizadas entre as partes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-4">
            Se encontrou uma boa oferta, aproveite agora.
          </h2>
          <p className="text-lg text-primary font-semibold mb-8">
            Amanhã ela pode não existir mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="text-base px-8">
                Ver ofertas ativas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="text-base px-8">
                <Store className="mr-2 h-4 w-4" />
                Anunciar minha empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
