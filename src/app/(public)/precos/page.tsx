import { Check, Zap, RotateCcw, BarChart3, Store, Shield, ArrowRight, Clock, Flame, UserPlus, CreditCard, Settings, PenSquare, Megaphone, MessageCircle, Timer, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Preços — Yeapy",
  description: "Planos e preços para anunciar suas ofertas na Yeapy. A partir de R$67/mês por anúncio ativo.",
}

const timelineSteps = [
  {
    icon: UserPlus,
    title: "Cadastre sua empresa",
    desc: "Crie sua conta com email e senha em menos de 1 minuto.",
  },
  {
    icon: CreditCard,
    title: "Escolha seu plano e realize o pagamento",
    desc: "PIX, cartão ou boleto. Ativação imediata.",
  },
  {
    icon: Settings,
    title: "Preencha seu perfil de empresa",
    desc: "Acesse sua área restrita e complete os dados da empresa.",
  },
  {
    icon: PenSquare,
    title: "Crie o seu anúncio",
    desc: "Clique em Minhas Ofertas e preencha os dados da oferta.",
  },
  {
    icon: Megaphone,
    title: "Publique sua oferta relâmpago",
    desc: "Sua oferta fica visível para milhares de consumidores.",
  },
  {
    icon: MessageCircle,
    title: "Receba contatos e vendas",
    desc: "Clientes entram em contato pelo WhatsApp ou link externo.",
  },
  {
    icon: Timer,
    title: "Oferta expira em 24 horas",
    desc: "Automaticamente, sem precisar fazer nada.",
  },
  {
    icon: RefreshCw,
    title: "Publique novamente e repita",
    desc: "Crie uma nova oferta e continue vendendo todos os dias.",
  },
]

export default function PrecosPage() {
  return (
    <div className="min-h-screen">
      {/* Porque anunciar na Yeapy */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Vantagens exclusivas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Por que anunciar na Yeapy?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              "A Yeapy NÃO cobra comissões sobre suas vendas. Você paga apenas o plano mensal e vende direto para o cliente.",
              "Chega de perder margem para marketplaces que ficam com parte do seu faturamento.",
              "Tráfego pago está cada vez mais caro. Na Yeapy, quem investe em audiência e divulgação da plataforma somos nós.",
              "Você reduz a dependência de gastar diariamente com anúncios para tentar vender.",
              "A Yeapy é uma das plataformas mais democráticas do Brasil. Pequenas e grandes empresas possuem o mesmo espaço, a mesma vitrine e a mesma oportunidade de destaque.",
              "Aqui, não importa o tamanho da empresa. O que chama atenção é a oferta.",
              "Suas promoções entram em uma vitrine ativa com ofertas de 24 horas, gerando urgência e mais chances de venda.",
              "Seus produtos ficam disponíveis para clientes que já entram na plataforma procurando oportunidades reais de compra.",
              "Mais velocidade para divulgar promoções, girar estoque e gerar movimento nas vendas.",
              "A Yeapy foi criada para empresas que querem vender mais sem depender de comissões abusivas e altos custos de tráfego.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-background border rounded-xl p-4 shadow-sm">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm md:text-base text-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/registro">
              <Button size="lg" className="text-base px-8 h-12">
                Quero anunciar na Yeapy
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline - Como anunciar */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              <Megaphone className="h-3.5 w-3.5 mr-1.5" />
              Passo a passo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Como anunciar no Yeapy?
            </h2>
            <p className="text-muted-foreground">
              Siga os passos abaixo e comece a vender em minutos
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

            <div className="space-y-6">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 md:gap-6">
                  {/* Step number circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="bg-background border rounded-xl p-4 flex-1 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">PASSO {i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-base">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Pricing */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/30 to-muted/40 pt-16 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Oferta por tempo limitado
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Anuncie suas ofertas
            <br />
            <span className="text-primary">para milhares de consumidores</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Modelo simples e transparente. Pague por anúncio ativo e publique
            ofertas ilimitadas durante a sua assinatura.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="container mx-auto px-4 -mt-6 mb-20">
        <div className="max-w-lg mx-auto">
          <Card className="relative border-2 border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Promo ribbon */}
            <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm font-semibold tracking-wide">
              🔥 PROMOÇÃO DE LANÇAMENTO — ECONOMIA DE R$30/MÊS
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Price */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Por anúncio ativo
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl text-muted-foreground/60 line-through font-medium">
                    R$97
                  </span>
                  <div>
                    <span className="text-6xl font-bold tracking-tight">R$67</span>
                    <span className="text-xl text-muted-foreground font-medium">/mês</span>
                  </div>
                </div>
                <p className="text-sm text-primary font-semibold">
                  🚀 Aproveite o preço promocional de lançamento — por tempo limitado!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cancele quando quiser. Sem fidelidade.
                </p>
              </div>

              {/* What's included */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Cada anúncio inclui:
                </p>
                <ul className="space-y-3">
                  {[
                    "1 espaço de oferta ativa por vez",
                    "Ofertas válidas por 24 horas",
                    "Renovação contínua e ilimitada",
                    "Página exclusiva da sua empresa",
                    "Painel administrativo completo",
                    "Rastreamento de cliques e visualizações",
                    "Histórico de preços automático",
                    "Nota fiscal emitida automaticamente",
                    "Selo de empresa verificada",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link href="/registro">
                <Button size="lg" className="w-full text-base h-13">
                  Começar agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              {/* Trust */}
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Pagamento seguro
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Ativa em segundos
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works - volume */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Precisa de mais espaço? Simples.
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Cada anúncio contratado é um espaço de oferta independente.
            Contrate quantos precisar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { qty: 1, price: 67, desc: "1 oferta simultânea" },
              { qty: 2, price: 134, desc: "2 ofertas simultâneas" },
              { qty: 3, price: 201, desc: "3 ofertas simultâneas" },
            ].map((plan) => (
              <Card key={plan.qty} className={plan.qty === 2 ? "border-primary/30 shadow-lg" : ""}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">{plan.qty}x</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      R${plan.price}<span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                  </div>
                  {plan.qty === 2 && (
                    <Badge variant="secondary" className="text-xs">Mais popular</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Limite máximo: 100 anúncios ativos por conta.
          </p>
        </div>
      </section>

      {/* How the ad works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Como funciona o anúncio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Store,
                title: "Publique sua oferta",
                desc: "Cadastre o produto, preço e link. Sua oferta fica ativa por 24 horas para milhares de consumidores.",
              },
              {
                icon: RotateCcw,
                title: "Renove continuamente",
                desc: "Quando a oferta expirar, publique uma nova no mesmo espaço contratado. Sem limites de publicações.",
              },
              {
                icon: BarChart3,
                title: "Acompanhe resultados",
                desc: "Veja cliques, visualizações e histórico de preços no painel. Dados reais para decisões inteligentes.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Perguntas frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "O que é um anúncio ativo?",
                a: "É o direito de manter uma oferta ativa na plataforma. Cada anúncio permite publicar 1 oferta por vez, válida por 24 horas. Quando expirar, você pode publicar outra.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Não há fidelidade. Você pode cancelar sua assinatura quando quiser. Suas ofertas ativas serão encerradas ao final do período pago.",
              },
              {
                q: "Preciso pagar a cada oferta que publico?",
                a: "Não! O pagamento é mensal pelo espaço de anúncio. Dentro dele, você pode publicar quantas ofertas quiser (uma por vez, cada uma dura 24h).",
              },
              {
                q: "Como funciona a regra de preço decrescente?",
                a: "Se você publicar o mesmo produto novamente, o preço promocional deve ser menor ou igual ao anterior. Isso garante ofertas reais para os consumidores.",
              },
              {
                q: "Quantos anúncios posso contratar?",
                a: "No máximo 100 anúncios ativos por conta. Cada anúncio custa R$67/mês e funciona de forma independente.",
              },
              {
                q: "Qual a forma de pagamento?",
                a: "Aceitamos PIX, cartão de crédito e boleto bancário. Nota fiscal emitida automaticamente após a confirmação do pagamento.",
              },
            ].map((faq, i) => (
              <div key={i} className="border-b pb-5 last:border-0">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Comece a vender mais hoje
          </h2>
          <p className="text-muted-foreground mb-8">
            Cadastre sua empresa, escolha seu plano e publique sua primeira
            oferta em menos de 5 minutos.
          </p>
          <Link href="/registro">
            <Button size="lg" className="text-base px-8 h-13">
              Criar conta gratuita
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Promoção de lançamento: <strong>de R$97 por R$67/mês</strong> por tempo limitado.
          </p>
        </div>
      </section>
    </div>
  )
}
