'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { MessageSquare, X, Phone, User, Check, AlertCircle } from 'lucide-react'

interface LinkWhatsAppModalProps {
  profileId: string
  profileUsername: string
  currentPhone?: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (phone: string) => void
}

export function LinkWhatsAppModal({
  profileId,
  profileUsername,
  currentPhone,
  isOpen,
  onClose,
  onSuccess
}: LinkWhatsAppModalProps) {
  const [phone, setPhone] = useState(currentPhone || '')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnlinking, setIsUnlinking] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim() || !name.trim()) {
      setError('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/profiles/${profileId}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao vincular WhatsApp')
      }

      onSuccess(data.phone)
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlink = async () => {
    if (!confirm('Deseja realmente desvincular o WhatsApp deste perfil?')) {
      return
    }

    setIsUnlinking(true)
    setError('')
    try {
      const res = await fetch(`/api/profiles/${profileId}/whatsapp`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao desvincular WhatsApp')
      }

      onSuccess('')
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {currentPhone ? 'Atualizar' : 'Vincular'} WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground">@{profileUsername}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Seu Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-2 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Número do WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 66632607531 (apenas números)"
              className="w-full px-4 py-2 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use apenas números, com código do país (ex: 5511999999999)
            </p>
          </div>

          {/* Explicação */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <Check className="w-3 h-3 inline mr-1" />
              Com WhatsApp vinculado, você pode:
            </p>
            <ul className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 space-y-1 ml-5 list-disc">
              <li>Criar conteúdo via WhatsApp</li>
              <li>Aprovar carrosséis pelo celular</li>
              <li>Receber slides prontos automaticamente</li>
              <li>Solicitar auditorias de perfis</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
              <p className="text-xs text-error-700 dark:text-error-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {currentPhone && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleUnlink}
                disabled={isLoading || isUnlinking}
                className="flex-1 text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/30"
              >
                {isUnlinking ? 'Desvinculando...' : 'Desvincular'}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading || isUnlinking}
              className={currentPhone ? '' : 'flex-1'}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || isUnlinking}
              className={currentPhone ? '' : 'flex-1'}
            >
              {isLoading ? 'Vinculando...' : currentPhone ? 'Atualizar' : 'Vincular'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
