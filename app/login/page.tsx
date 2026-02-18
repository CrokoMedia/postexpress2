'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccess('Senha alterada com sucesso! Faça login com a nova senha.')
      return
    }

    // Redirecionar para dashboard se já estiver logado
    const supabase = createClientSupabase()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.role === 'admin') {
        router.push('/dashboard')
      } else if (data.profile_ids?.length === 1) {
        router.push(`/dashboard/profiles/${data.profile_ids[0]}`)
      } else if (data.profile_ids?.length > 1) {
        router.push('/dashboard/meus-perfis')
      }
    })
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClientSupabase()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(`Erro: ${authError.message}`)
        return
      }

      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (data.role === 'admin') {
        router.push('/dashboard')
      } else if (data.profile_ids?.length === 1) {
        router.push(`/dashboard/profiles/${data.profile_ids[0]}`)
      } else if (data.profile_ids?.length > 1) {
        router.push('/dashboard/meus-perfis')
      } else {
        router.push('/dashboard')
      }

      router.refresh()
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
          <span className="text-white font-bold text-lg">PE</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-50">Post Express</h1>
        <p className="text-neutral-400 text-sm mt-1">Faça login para continuar</p>
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1.5">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/login/forgot-password" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
          Esqueceu a senha?
        </Link>
      </div>

      <p className="text-center text-xs text-neutral-600 mt-4">
        Pazos Media · Post Express v1.0
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm px-4 flex justify-center">
        <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
