'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { FileText, Upload, X, Check, Loader2 } from 'lucide-react'

interface ProfileContextModalProps {
  profileId: string
  username: string
  onClose: () => void
  onSave: () => void
}

export function ProfileContextModal({ profileId, username, onClose, onSave }: ProfileContextModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingContext, setLoadingContext] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [nicho, setNicho] = useState('')
  const [objetivos, setObjetivos] = useState('')
  const [publicoAlvo, setPublicoAlvo] = useState('')
  const [produtosServicos, setProdutosServicos] = useState('')
  const [tomVoz, setTomVoz] = useState('')
  const [contextoAdicional, setContextoAdicional] = useState('')
  const [files, setFiles] = useState<any[]>([])

  // Carregar contexto existente
  useEffect(() => {
    fetchContext()
  }, [profileId])

  const fetchContext = async () => {
    try {
      const res = await fetch(`/api/profiles/${profileId}/context`)
      if (res.ok) {
        const data = await res.json()
        if (data.context) {
          setNicho(data.context.nicho || '')
          setObjetivos(data.context.objetivos || '')
          setPublicoAlvo(data.context.publico_alvo || '')
          setProdutosServicos(data.context.produtos_servicos || '')
          setTomVoz(data.context.tom_voz || '')
          setContextoAdicional(data.context.contexto_adicional || '')
          setFiles(data.context.files || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    } finally {
      setLoadingContext(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/profiles/${profileId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await res.json()
      setFiles([...files, data.file])
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profiles/${profileId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho,
          objetivos,
          publico_alvo: publicoAlvo,
          produtos_servicos: produtosServicos,
          tom_voz: tomVoz,
          contexto_adicional: contextoAdicional,
          files
        })
      })

      if (!res.ok) throw new Error('Erro ao salvar contexto')

      onSave()
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingContext) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
            <p className="text-neutral-400">Carregando contexto...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <Card className="w-full">
          <CardHeader className="sticky top-0 bg-neutral-900 z-10 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Adicionar Contexto</CardTitle>
                <p className="text-sm text-neutral-400 mt-1">@{username}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
          {/* Nicho */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nicho / Área de Atuação
            </label>
            <input
              type="text"
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              placeholder="Ex: Marketing Digital, Fitness, Finanças..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Objetivos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Objetivos do Expert
            </label>
            <textarea
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
              placeholder="O que o expert quer alcançar? Vender cursos? Construir autoridade? Gerar leads?"
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Público-Alvo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Público-Alvo
            </label>
            <textarea
              value={publicoAlvo}
              onChange={(e) => setPublicoAlvo(e.target.value)}
              placeholder="Quem é o público? Idade, interesses, dores, aspirações..."
              rows={3}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Produtos/Serviços */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Produtos / Serviços
            </label>
            <textarea
              value={produtosServicos}
              onChange={(e) => setProdutosServicos(e.target.value)}
              placeholder="Quais produtos/serviços o expert oferece?"
              rows={2}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Tom de Voz */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tom de Voz Desejado
            </label>
            <input
              type="text"
              value={tomVoz}
              onChange={(e) => setTomVoz(e.target.value)}
              placeholder="Ex: Profissional, Casual, Motivacional, Técnico..."
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Contexto Adicional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contexto Adicional
            </label>
            <textarea
              value={contextoAdicional}
              onChange={(e) => setContextoAdicional(e.target.value)}
              placeholder="Qualquer outra informação relevante sobre o expert, estratégia, história, diferenciais..."
              rows={4}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Upload de Arquivos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Arquivos (PDFs, CSVs, DOCs)
            </label>
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-400 mb-3">
                Adicione ebooks, materiais, planilhas, briefings
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.csv,.txt,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="file-upload" className="inline-block">
                <span className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-neutral-800 text-neutral-50 border border-neutral-600 hover:bg-neutral-700 h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-50">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Escolher Arquivo
                    </>
                  )}
                </span>
              </label>
              <p className="text-xs text-neutral-500 mt-2">
                Max 10MB • PDF, CSV, TXT, DOCX, DOC
              </p>
            </div>

            {/* Lista de Arquivos */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-neutral-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-900 pb-6 -mb-6 border-t border-neutral-800 mt-6 pt-6">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Contexto
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
