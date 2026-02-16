'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { Progress } from '@/components/atoms/progress'
import { Badge } from '@/components/atoms/badge'
import { DocumentUploader } from '@/components/molecules/document-uploader'
import { useRouter } from 'next/navigation'
import { useAnalysisStatus } from '@/hooks/use-analysis-status'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [postLimit, setPostLimit] = useState(10)
  const [skipOcr, setSkipOcr] = useState(false)
  const [queueId, setQueueId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDocUploader, setShowDocUploader] = useState(false)

  const { status, progress, currentPhase, result, error: analysisError } = useAnalysisStatus(queueId || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          post_limit: postLimit,
          skip_ocr: skipOcr,
          audit_type: 'express'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar análise')
      }

      setQueueId(data.queue_id)
      toast.success('Análise iniciada com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar análise')
      setIsSubmitting(false)
    }
  }

  // Redirect when completed
  if (status === 'completed' && result) {
    setTimeout(() => {
      router.push(`/dashboard/audits/${result.id}`)
    }, 1500)
  }

  return (
    <div>
      <PageHeader
        title="Nova Análise"
        description="Inicie uma auditoria completa de um perfil do Instagram"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {!queueId ? (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Análise</CardTitle>
              <CardDescription>
                Informe o username do Instagram e configure os parâmetros da análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Username do Instagram
                  </label>
                  <Input
                    type="text"
                    placeholder="frankcosta"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    pattern="[a-zA-Z0-9._]+"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Apenas o username, sem @
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Quantidade de Posts ({postLimit})
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={postLimit}
                    onChange={(e) => setPostLimit(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Quanto mais posts, mais precisa a análise (5-50)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="skip-ocr"
                    checked={skipOcr}
                    onChange={(e) => setSkipOcr(e.target.checked)}
                    className="rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="skip-ocr" className="text-sm text-neutral-300">
                    Pular OCR (mais rápido, mas sem análise de texto em imagens)
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={isSubmitting || !username.trim()}
                >
                  Iniciar Análise
                </Button>

                {/* Toggle para mostrar upload de documentos */}
                <button
                  type="button"
                  onClick={() => setShowDocUploader(!showDocUploader)}
                  className="w-full text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <FileText className="h-4 w-4" />
                  {showDocUploader ? 'Ocultar' : 'Mostrar'} Upload de Documentos
                </button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análise em Andamento</CardTitle>
                  <CardDescription>@{username}</CardDescription>
                </div>
                <Badge
                  variant={
                    status === 'completed' ? 'success' :
                    status === 'failed' ? 'error' :
                    status === 'processing' ? 'info' :
                    'neutral'
                  }
                >
                  {status === 'pending' && 'Na fila'}
                  {status === 'processing' && 'Processando'}
                  {status === 'completed' && 'Concluído'}
                  {status === 'failed' && 'Falhou'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress || 0} max={100} showLabel />

              {currentPhase && (
                <div className="text-sm text-neutral-400">
                  Fase atual: <span className="text-neutral-300 font-medium">{currentPhase}</span>
                </div>
              )}

              {analysisError && (
                <div className="text-sm text-error-500 bg-error-500/10 border border-error-500/20 rounded-lg p-3">
                  {analysisError}
                </div>
              )}

              {status === 'completed' && (
                <div className="text-success-500 text-center">
                  ✓ Análise concluída! Redirecionando...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Uploader */}
        {!queueId && showDocUploader && username.trim() && (
          <DocumentUploader
            username={username.trim()}
            onUploadComplete={(doc) => {
              console.log('Document uploaded:', doc)
            }}
          />
        )}
      </div>
    </div>
  )
}
