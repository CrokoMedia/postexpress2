'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentUploaderProps {
  username: string
  onUploadComplete?: (document: any) => void
}

export function DocumentUploader({ username, onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('posicionamento')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar tamanho (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB')
        return
      }

      // Validar tipo
      const validTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Tipo de arquivo inválido. Use: PDF, DOCX ou TXT')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('username', username)
      formData.append('description', description)
      formData.append('category', category)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      toast.success('Documento enviado com sucesso!')
      setUploadedDocs([...uploadedDocs, data.document])

      // Reset
      setFile(null)
      setDescription('')
      setCategory('posicionamento')

      // Callback
      if (onUploadComplete) {
        onUploadComplete(data.document)
      }

    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Envie PDFs, DOCX ou TXT com informações sobre o posicionamento, biografia ou conteúdo do expert
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de arquivo */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Arquivo
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Formatos aceitos: PDF, DOCX, TXT (máx. 10MB)
          </p>
        </div>

        {/* Arquivo selecionado */}
        {file && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={removeFile}
              disabled={isUploading}
              className="text-neutral-400 hover:text-error-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isUploading}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
          >
            <option value="posicionamento">Posicionamento</option>
            <option value="conteudo">Conteúdo</option>
            <option value="biografia">Biografia</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            placeholder="Descreva o conteúdo deste documento..."
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 resize-none"
          />
        </div>

        {/* Botão de upload */}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          loading={isUploading}
          className="w-full"
          variant="primary"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Enviando...' : 'Enviar Documento'}
        </Button>

        {/* Lista de documentos enviados */}
        {uploadedDocs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Documentos Enviados ({uploadedDocs.length})
            </h4>
            <div className="space-y-2">
              {uploadedDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-3 flex items-center gap-3"
                >
                  {doc.extraction_status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-success-500 shrink-0" />
                  ) : doc.extraction_status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-error-500 shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-neutral-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-neutral-500">
                      {doc.document_category} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
