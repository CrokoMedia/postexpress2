'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/atoms/button'
import { Instagram, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ConnectInstagramButtonProps {
  profileId: string
  isConnected?: boolean
  tokenExpiresAt?: string | null
}

export function ConnectInstagramButton({
  profileId,
  isConnected: initialIsConnected = false,
  tokenExpiresAt: initialTokenExpiresAt
}: ConnectInstagramButtonProps) {
  const [isConnected, setIsConnected] = useState(initialIsConnected)
  const [tokenExpiresAt, setTokenExpiresAt] = useState(initialTokenExpiresAt)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Verificar query params ao carregar (callback OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('instagram_connected')
    const error = params.get('error')
    const errorMessage = params.get('message')

    if (connected === 'true') {
      setMessage({
        type: 'success',
        text: '✅ Instagram conectado com sucesso!'
      })
      setIsConnected(true)
      // Limpar query params
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error) {
      let errorText = '❌ Erro ao conectar Instagram'
      if (error === 'oauth_cancelled') {
        errorText = 'Conexão cancelada'
      } else if (errorMessage) {
        errorText = `❌ ${decodeURIComponent(errorMessage)}`
      }
      setMessage({ type: 'error', text: errorText })
      // Limpar query params após 5 segundos
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname)
      }, 5000)
    }
  }, [])

  // Verificar se o token está próximo de expirar
  const isTokenExpiring = () => {
    if (!tokenExpiresAt) return false

    const expirationDate = new Date(tokenExpiresAt)
    const now = new Date()
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0
  }

  const isTokenExpired = () => {
    if (!tokenExpiresAt) return false

    const expirationDate = new Date(tokenExpiresAt)
    const now = new Date()

    return expirationDate < now
  }

  const handleConnect = () => {
    setLoading(true)
    window.location.href = `/api/auth/instagram?profile_id=${profileId}`
  }

  const tokenExpired = isTokenExpired()
  const tokenExpiring = isTokenExpiring()

  return (
    <div className="space-y-2">
      {!isConnected || tokenExpired ? (
        <Button
          variant="primary"
          onClick={handleConnect}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Instagram className="w-4 h-4" />
          )}
          {tokenExpired ? 'Reconectar Instagram' : 'Conectar Instagram'}
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-success-100 text-success-700 rounded-md border border-success-200">
            <CheckCircle className="w-4 h-4" />
            Instagram Conectado
          </div>

          {tokenExpiring && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 border-warning-500 text-warning-600"
            >
              <AlertCircle className="w-4 h-4" />
              Renovar Token
            </Button>
          )}
        </div>
      )}

      {/* Mensagens de feedback */}
      {message && (
        <div
          className={`text-sm p-2 rounded-md ${
            message.type === 'success'
              ? 'bg-success-100 text-success-700 border border-success-200'
              : 'bg-error-100 text-error-700 border border-error-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Aviso de expiração */}
      {isConnected && tokenExpiresAt && !tokenExpired && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          {tokenExpiring ? (
            <div className="flex items-center gap-1 text-warning-600">
              <AlertCircle className="w-3 h-3" />
              Token expira em breve
            </div>
          ) : (
            `Token válido até ${new Date(tokenExpiresAt).toLocaleDateString('pt-BR')}`
          )}
        </div>
      )}
    </div>
  )
}
