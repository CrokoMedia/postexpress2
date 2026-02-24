'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useContentCreation } from '@/store/content-creation'
import { useAudit } from '@/hooks/use-audit'
import { PageHeader } from '@/components/molecules/page-header'
import { ProgressStepper } from '@/components/molecules/progress-stepper'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Phase1Criar } from './components/phase-1-criar'
import { Phase2Refinar } from './components/phase-2-refinar'
import { Phase3Exportar } from './components/phase-3-exportar'

export default function CreateContentPageV2() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { audit, isLoading, isError } = useAudit(id)
  const {
    currentPhase,
    goToPhase,
    setCarousels,
    setGeneratedSlides,
  } = useContentCreation()

  // Carregar conteúdo existente ao abrir a página
  useEffect(() => {
    const loadExistingContent = async () => {
      if (!id) return

      try {
        const response = await fetch(`/api/audits/${id}/content`)
        if (response.ok) {
          const data = await response.json()

          // Carregar carrosséis existentes
          if (data.content?.carousels && data.content.carousels.length > 0) {
            setCarousels(data.content.carousels)
            console.log('✅ Carrosséis carregados:', data.content.carousels.length)
          }

          // Carregar slides gerados (V2/V3)
          if (data.slides_v2) {
            setGeneratedSlides(data.slides_v2)
            console.log('✅ Slides V2/V3 carregados')
          }
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo existente:', err)
      }
    }

    loadExistingContent()
  }, [id, setCarousels, setGeneratedSlides])

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Carregando auditoria...</h3>
            <p className="text-muted-foreground">
              Buscando dados da auditoria
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError || !audit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-error-500">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-error-500" />
            <h3 className="text-xl font-semibold mb-2">Erro ao carregar auditoria</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados da auditoria
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Voltar para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/audits/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Auditoria
        </Button>

        <PageHeader
          title={`Criar Conteúdo - @${audit.profile?.username || 'Perfil'}`}
          description="Fluxo otimizado de criação de carrosséis"
        />
      </div>

      {/* Progress Stepper */}
      <ProgressStepper
        currentStep={currentPhase}
        onStepClick={(step) => goToPhase(step as 1 | 2 | 3)}
        allowNavigation={true}
      />

      {/* Renderizar fase atual */}
      <div className="mt-8">
        {currentPhase === 1 && <Phase1Criar auditId={id} />}
        {currentPhase === 2 && <Phase2Refinar auditId={id} />}
        {currentPhase === 3 && (
          <Phase3Exportar
            auditId={id}
            profileId={audit.profile_id}
            username={audit.profile?.username || 'perfil'}
          />
        )}
      </div>
    </div>
  )
}
