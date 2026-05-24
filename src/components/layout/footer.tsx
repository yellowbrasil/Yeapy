import Link from "next/link"
import { Flame } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-bold">Yeapy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ofertas temporarias de 24 horas. Oportunidades reais todos os dias.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Explorar</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Ofertas ativas
              </Link>
              <Link href="/busca" className="text-sm text-muted-foreground hover:text-foreground">
                Buscar
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Para empresas</h4>
            <div className="flex flex-col gap-2">
              <Link href="/registro" className="text-sm text-muted-foreground hover:text-foreground">
                Cadastre sua empresa
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Acessar painel
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contato</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                contato@yeapy.shop
              </span>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Yeapy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
