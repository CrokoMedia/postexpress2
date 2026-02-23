'use client'

import { useParams, useRouter } from 'next/navigation'
import { useContentCreation } from '@/store/content-creation'
import { PageHeader } from '@/components/molecules/page-header'
import { ProgressStepper } from '@/components/molecules/progress-stepper'
import { Button } from '@/components/atoms/button'
import { ArrowLeft } from 'lucide-react'
import { Phase1Criar } from './components/phase-1-criar'
import { Phase2Refinar } from './components/phase-2-refinar'
import { Phase3Exportar } from './components/phase-3-exportar'

export default function CreateContentPageV2() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const {
    currentPhase,
    goToPhase,
  } = useContentCreation()

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
          title="Criar Conteúdo"
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
        {currentPhase === 3 && <Phase3Exportar auditId={id} />}
      </div>
    </div>
  )
}
