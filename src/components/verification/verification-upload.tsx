"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Check, AlertCircle, Loader } from "lucide-react"

interface VerificationUploadProps {
  companyId: string
  isVerified: boolean
  verificationStatus: string
}

export function VerificationUpload({
  companyId,
  isVerified,
  verificationStatus,
}: VerificationUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSuccess(true)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Verificação de Empresa</CardTitle>
            <CardDescription>
              Envie documentos para validação manual e obtenha o selo de empresa verificada
            </CardDescription>
          </div>
          {isVerified && (
            <Badge className="bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              Verificada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-300">
                  Empresa verificada!
                </p>
                <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                  Sua empresa possui o selo de verificação. Ele aparece no seu perfil e em seus
                  anúncios.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {verificationStatus === "pending" && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-300">
                      Documentos em análise
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                      Seus documentos estão sendo analisados pela administração. Você receberá um
                      retorno em breve.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === "rejected" && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-300">
                      Documentos rejeitados
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                      Seus documentos foram rejeitados. Você pode enviar novos documentos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-300">
                      Arquivo enviado com sucesso!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                      Sua solicitação foi enviada para análise.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {verificationStatus !== "pending" && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-semibold mb-1">
                  {loading ? "Enviando..." : "Clique para enviar documento"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  PDF, PNG ou JPEG. Máximo 5MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar arquivo
                    </>
                  )}
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              <strong>Formatos aceitos:</strong> PDF, PNG, JPG, JPEG (máximo 5MB)
              <br />
              <strong>Envio:</strong> Opcional - não é obrigatório para usar a plataforma
              <br />
              <strong>Análise:</strong> Manual pela administração da Yeapy
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
