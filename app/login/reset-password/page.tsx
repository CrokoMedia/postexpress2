'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const supabase = createClientSupabase()

    // Supabase envia o link com hash: #access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (type === 'recovery' && accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            setSessionError('Link inválido ou expirado. Solicite um novo.')
          } else {
            setReady(true)
          }
        })
    } else {
      setSessionError('Link inválido. Solicite um novo link de recuperação.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClientSupabase()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push('/login?reset=success')
    } finally {
      setLoading(false)
    }
  }

  if (sessionError) {
    return (
      <div className="w-full max-w-sm px-4 text-center">
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-4 text-sm text-red-400 mb-4">
          {sessionError}
        </div>
        <a href="/login/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition">
          Solicitar novo link
        </a>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="w-full max-w-sm px-4 text-center">
        <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-neutral-400 text-sm">Verificando link de recuperação...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
          <span className="text-white font-bold text-lg">PE</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-50">Nova senha</h1>
        <p className="text-neutral-400 text-sm mt-1">Digite sua nova senha</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Confirmar nova senha
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="Repita a senha"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition"
        >
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
