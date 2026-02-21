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
  const [documents, setDocuments] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)

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
          setDocuments(data.context.documents || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    } finally {
      setLoadingContext(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/profiles/${profileId}/context/upload`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await res.json()
      setDocuments([...documents, data.document])

      // Recarregar contexto para pegar raw_text atualizado
      await fetchContext()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleRemoveDocument = async (docId: string) => {
    if (!confirm('Remover este documento?')) return

    try {
      const res = await fetch(`/api/profiles/${profileId}/context/documents/${docId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Erro ao remover documento')

      setDocuments(documents.filter(d => d.id !== docId))
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
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
              Documentos (PDF, DOCX, TXT, MD)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-neutral-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-400 mb-1">
                {isDragging ? 'Solte o arquivo aqui' : 'Arraste arquivos ou clique para escolher'}
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                Briefings, ebooks, materiais de referência
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileInput}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="file-upload" className="inline-block">
                <span className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-neutral-800 text-neutral-50 border border-neutral-600 hover:bg-neutral-700 h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-50">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extraindo texto...
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
                Max 10MB • Texto será extraído automaticamente
              </p>
            </div>

            {/* Lista de Documentos */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-xs text-neutral-400">
                          {(doc.size / 1024).toFixed(1)} KB • {doc.extracted_text_length || 0} caracteres extraídos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      title="Remover documento"
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
