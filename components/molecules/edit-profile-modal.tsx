'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, User } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'

interface EditProfileModalProps {
  profileId: string
  username: string
  currentGender: string | null
  genderAutoDetected: boolean
  genderConfidence: number | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

type Gender = 'masculino' | 'feminino' | 'neutro' | 'empresa'

const GENDER_OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'masculino', label: 'Masculino', emoji: '👨' },
  { value: 'feminino', label: 'Feminino', emoji: '👩' },
  { value: 'neutro', label: 'Neutro', emoji: '🧑' },
  { value: 'empresa', label: 'Empresa/Marca', emoji: '🏢' }
]

export function EditProfileModal({
  profileId,
  username,
  currentGender,
  genderAutoDetected,
  genderConfidence,
  isOpen,
  onClose,
  onSave
}: EditProfileModalProps) {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(
    currentGender as Gender | null
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset ao abrir modal
  useEffect(() => {
    if (isOpen) {
      setSelectedGender(currentGender as Gender | null)
      setError('')
    }
  }, [isOpen, currentGender])

  const handleSave = async () => {
    if (!selectedGender) {
      setError('Selecione um gênero')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: selectedGender })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Editar Perfil</h3>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Auto-detection info */}
          {genderAutoDetected && currentGender && (
            <div className="bg-info-50 dark:bg-info-900/20 rounded-xl p-4 border border-info-200 dark:border-info-800">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Badge variant="info" className="text-xs">
                    Auto-detectado
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-info-900 dark:text-info-100 font-medium mb-1">
                    Gênero detectado automaticamente
                  </p>
                  <p className="text-xs text-info-700 dark:text-info-300">
                    Confiança: {((genderConfidence || 0) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-info-600 dark:text-info-400 mt-2">
                    Você pode alterar manualmente se necessário.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No gender detected yet */}
          {!currentGender && (
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-4 border border-warning-200 dark:border-warning-800">
              <p className="text-xs text-warning-900 dark:text-warning-100 font-medium mb-1">
                Gênero ainda não definido
              </p>
              <p className="text-xs text-warning-700 dark:text-warning-300">
                Selecione abaixo para personalizar o conteúdo gerado.
              </p>
            </div>
          )}

          {/* Gender selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Selecione o gênero do perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedGender(option.value)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-left
                    ${selectedGender === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md shadow-primary-500/10'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-card'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        selectedGender === option.value
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-foreground'
                      }`}>
                        {option.label}
                      </p>
                    </div>
                    {selectedGender === option.value && (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Explicação */}
          <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Por que isso importa?</strong><br />
              O gênero é usado para personalizar a linguagem do conteúdo gerado (ex: "ele" vs "ela", "empreendedor" vs "empreendedora").
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !selectedGender}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
