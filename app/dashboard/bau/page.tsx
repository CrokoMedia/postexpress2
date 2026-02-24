'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { Archive, Trash2, Eye, Calendar, User, FileText, Image as ImageIcon, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'

interface ContentItem {
  id: string
  audit_id: string
  profile_id: string
  content_json: any
  slides_json: any
  slides_v2_json: any
  generated_at: string
  profiles: {
    username: string
    full_name: string
  }
  audits: {
    classification: string
  }
}

export default function BauPage() {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadContents()
  }, [])

  async function loadContents() {
    try {
      setLoading(true)
      const supabase = createClientSupabase()

      const { data, error: fetchError } = await supabase
        .from('content_suggestions')
        .select(`
          id,
          audit_id,
          profile_id,
          content_json,
          slides_json,
          slides_v2_json,
          generated_at,
          profiles!left(username, full_name),
          audits!left(classification)
        `)
        .order('generated_at', { ascending: false })

      if (fetchError) throw fetchError

      // Processar dados para formato correto
      const processedData = (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        audits: Array.isArray(item.audits) ? item.audits[0] : item.audits,
      }))

      setContents(processedData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setDeletingId(id)
      const supabase = createClientSupabase()

      const { error: deleteError } = await supabase
        .from('content_suggestions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remover da lista
      setContents(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  function getApprovedCount(contentJson: any): number {
    if (!contentJson?.carousels) return 0
    return contentJson.carousels.filter((c: any) => c.approved === true).length
  }

  function getTotalCarousels(contentJson: any): number {
    return contentJson?.carousels?.length || 0
  }

  function hasSlides(item: ContentItem): boolean {
    return !!(item.slides_json || item.slides_v2_json)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
        <PageHeader
          title="Baú de Conteúdos"
          description="Todos os conteúdos gerados e aprovados"
                  />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
        <PageHeader
          title="Baú de Conteúdos"
          description="Todos os conteúdos gerados e aprovados"
                  />
        <Card className="mt-6 border-error-500">
          <CardContent className="p-6">
            <p className="text-error-500">Erro ao carregar conteúdos: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
      <PageHeader
        title="Baú de Conteúdos"
        description={`${contents.length} conteúdo${contents.length !== 1 ? 's' : ''} gerado${contents.length !== 1 ? 's' : ''}`}
              />

      {contents.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <Archive className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-2">Nenhum conteúdo encontrado</p>
            <p className="text-muted-foreground text-sm">Os conteúdos gerados aparecerão aqui</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {contents.map(item => {
            const totalCarousels = getTotalCarousels(item.content_json)
            const approvedCount = getApprovedCount(item.content_json)
            const hasVisualSlides = hasSlides(item)

            return (
              <Card key={item.id} className="border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-xl">
                          {item.profiles?.full_name || item.profiles?.username || 'Perfil desconhecido'}
                        </CardTitle>
                        {item.profiles?.username && (
                          <Badge variant="neutral" className="text-xs">
                            @{item.profiles.username}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="info" className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {totalCarousels} carrossel{totalCarousels !== 1 ? 'ís' : ''}
                        </Badge>

                        {approvedCount > 0 && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {approvedCount} aprovado{approvedCount !== 1 ? 's' : ''}
                          </Badge>
                        )}

                        {hasVisualSlides && (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Slides visuais
                          </Badge>
                        )}

                        <Badge variant="neutral" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.generated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Badge>
                      </div>

                      {item.content_json?.estrategia_geral && (
                        <CardDescription className="mt-3 line-clamp-2">
                          {item.content_json.estrategia_geral}
                        </CardDescription>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/audits/${item.audit_id}/create-content`}>
                        <Button variant="secondary" size="sm" title="Ver/Editar conteúdo">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </Link>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Excluir conteúdo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Preview dos carrosséis */}
                {item.content_json?.carousels && item.content_json.carousels.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {item.content_json.carousels.slice(0, 3).map((carousel: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            carousel.approved === true
                              ? 'border-success-500/50 bg-success-500/5'
                              : carousel.approved === false
                              ? 'border-error-500/30 bg-error-500/5'
                              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-1">{carousel.titulo}</h4>
                            {carousel.approved === true && (
                              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                            )}
                            {carousel.approved === false && (
                              <XCircle className="w-4 h-4 text-error-500 flex-shrink-0" />
                            )}
                          </div>
                          <Badge variant="neutral" className="text-xs">
                            {carousel.tipo}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {carousel.slides?.length || 0} slides
                          </p>
                        </div>
                      ))}
                    </div>

                    {item.content_json.carousels.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        +{item.content_json.carousels.length - 3} carrossel{item.content_json.carousels.length - 3 !== 1 ? 'ís' : ''}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
