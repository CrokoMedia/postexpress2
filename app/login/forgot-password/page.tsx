'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClientSupabase()
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset-password`,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-50 mb-2">Email enviado!</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Verifique sua caixa de entrada em <span className="text-neutral-200">{email}</span> e clique no link para redefinir sua senha.
        </p>
        <Link href="/login" className="text-sm text-primary-400 hover:text-primary-300 transition">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
          <span className="text-white font-bold text-lg">PE</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-50">Recuperar senha</h1>
        <p className="text-neutral-400 text-sm mt-1 text-center">
          Informe seu email e enviaremos um link para redefinir a senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="seu@email.com"
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
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
