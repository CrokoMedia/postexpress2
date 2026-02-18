'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Progress } from '@/components/atoms/progress'
import { Button } from '@/components/atoms/button'
import {
  Camera,
  MessageCircle,
  Search,
  Target,
  Database,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Trash2,
  AlertCircle,
  ListChecks
} from 'lucide-react'
import { Skeleton } from '@/components/atoms/skeleton'
import { PageHeader } from '@/components/molecules/page-header'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface QueueItem {
  id: string
  username: string
  post_limit: number
  skip_ocr: boolean
  status: string
  progress: number
  current_phase: string | null
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  retry_count: number
}

export default function QueuePage() {
  const { data, error, isLoading, mutate } = useSWR<QueueItem[]>(
    '/api/queue',
    fetcher,
    { refreshInterval: 2000 } // Atualiza a cada 2 segundos
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'neutral' | 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      processing: 'neutral',
      completed: 'success',
      failed: 'error'
    }
    return variants[status] || 'neutral'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Aguardando',
      processing: 'Processando',
      completed: 'Concluído',
      failed: 'Falhou'
    }
    return texts[status] || status
  }

  const getPhaseIcon = (phase: string | null) => {
    const icons: Record<string, any> = {
      scraping: Camera,
      comments: MessageCircle,
      ocr: Search,
      audit: Target,
      saving: Database,
      completed: CheckCircle2,
      error: XCircle
    }
    return icons[phase || 'pending'] || Clock
  }

  const getPhaseText = (phase: string | null) => {
    if (!phase) return 'Aguardando'

    const phases: Record<string, string> = {
      scraping: 'Scraping posts',
      comments: 'Extraindo comentários',
      ocr: 'Análise OCR',
      audit: 'Auditoria (5 auditores)',
      saving: 'Salvando no banco',
      completed: 'Concluído',
      error: 'Erro'
    }
    return phases[phase] || phase
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta análise?')) return

    try {
      const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao deletar')
      mutate() // Atualiza lista
    } catch (error) {
      alert('Erro ao deletar análise')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getElapsedTime = (startedAt: string | null) => {
    if (!startedAt) return '-'
    const start = new Date(startedAt).getTime()
    const now = Date.now()
    const diff = Math.floor((now - start) / 1000) // segundos

    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <PageHeader
          title="Fila de Análises"
          description="Acompanhe o progresso das análises em andamento"
        />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fila de Análises</h1>
          <p className="text-red-600">Erro ao carregar dados da fila</p>
        </div>
      </div>
    )
  }

  const pending = data?.filter(item => item.status === 'pending') || []
  const processing = data?.filter(item => item.status === 'processing') || []
  const completed = data?.filter(item => item.status === 'completed') || []
  const failed = data?.filter(item => item.status === 'failed') || []

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fila de Análises</h1>
        <p className="text-gray-600">Acompanhe o status das análises em tempo real</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Aguardando</div>
          <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Processando</div>
          <div className="text-2xl font-bold text-blue-600">{processing.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Concluídos</div>
          <div className="text-2xl font-bold text-green-600">{completed.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Falharam</div>
          <div className="text-2xl font-bold text-red-600">{failed.length}</div>
        </Card>
      </div>

      {/* Análises em processamento */}
      {processing.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Em Processamento
          </h2>
          <div className="space-y-3">
            {processing.map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg">@{item.username}</div>
                    <div className="text-sm text-gray-600">
                      {item.post_limit} posts • {item.skip_ocr ? 'Sem OCR' : 'Com OCR'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      title="Deletar análise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 flex items-center gap-1">
                      {(() => {
                        const PhaseIcon = getPhaseIcon(item.current_phase)
                        return <PhaseIcon className="w-4 h-4" />
                      })()}
                      {getPhaseText(item.current_phase)}
                    </span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Iniciado: {formatDate(item.started_at)}</div>
                  <div>Tempo: {getElapsedTime(item.started_at)}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Análises aguardando */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Aguardando Processamento
          </h2>
          <div className="space-y-3">
            {pending.map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-yellow-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">@{item.username}</div>
                    <div className="text-sm text-gray-600">
                      {item.post_limit} posts • {item.skip_ocr ? 'Sem OCR' : 'Com OCR'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Criado: {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Aguardando</Badge>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      title="Deletar análise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {item.retry_count > 0 && (
                  <div className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Tentativa {item.retry_count}/3
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Análises concluídas */}
      {completed.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Concluídos
          </h2>
          <div className="space-y-3">
            {completed.slice(0, 5).map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">@{item.username}</div>
                    <div className="text-sm text-gray-600">
                      Concluído em {formatDate(item.completed_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Concluído</Badge>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      title="Deletar análise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Análises com falha */}
      {failed.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Com Falha
          </h2>
          <div className="space-y-3">
            {failed.map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-red-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold">@{item.username}</div>
                    <div className="text-sm text-gray-600">
                      {item.post_limit} posts • {item.skip_ocr ? 'Sem OCR' : 'Com OCR'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="error">Falhou</Badge>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      title="Deletar análise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {item.error_message && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    {item.error_message}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Tentativas: {item.retry_count}/3
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem se vazio */}
      {!data || data.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="flex justify-center mb-2">
              <ListChecks className="w-16 h-16 text-gray-400" />
            </div>
            <div className="font-semibold">Nenhuma análise na fila</div>
            <div className="text-sm">Crie uma nova análise para começar</div>
          </div>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Atualizando automaticamente a cada 2 segundos
      </div>
    </div>
  )
}
