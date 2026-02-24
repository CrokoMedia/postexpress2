'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/atoms/badge'
import { FileText, AlertCircle } from 'lucide-react'

interface ContextUsageBadgeProps {
  profileId: string
  showDetails?: boolean
}

export function ContextUsageBadge({ profileId, showDetails = false }: ContextUsageBadgeProps) {
  const [hasContext, setHasContext] = useState<boolean | null>(null)
  const [contextData, setContextData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkContext() {
      try {
        const res = await fetch(`/api/profiles/${profileId}/context`)
        if (res.ok) {
          const data = await res.json()
          setHasContext(!!data.context)
          setContextData(data.context)
        }
      } catch (error) {
        console.error('Erro ao verificar contexto:', error)
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      checkContext()
    }
  }, [profileId])

  if (loading) {
    return (
      <Badge variant="neutral" className="gap-1">
        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
        Verificando contexto...
      </Badge>
    )
  }

  if (hasContext) {
    const fieldsCount = [
      contextData?.nicho,
      contextData?.objetivos,
      contextData?.publico_alvo,
      contextData?.produtos_servicos,
      contextData?.tom_voz
    ].filter(Boolean).length

    const docsCount = (contextData?.documents || []).length

    return (
      <div className="flex items-center gap-2">
        <Badge variant="success" className="gap-1">
          <FileText className="w-3 h-3" />
          Contexto Usado
        </Badge>
        {showDetails && (
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {fieldsCount} campos • {docsCount} docs
          </span>
        )}
      </div>
    )
  }

  return (
    <Badge variant="warning" className="gap-1">
      <AlertCircle className="w-3 h-3" />
      Sem Contexto (Análise Genérica)
    </Badge>
  )
}
