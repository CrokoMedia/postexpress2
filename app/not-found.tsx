import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500">404</h1>
        <p className="mt-4 text-lg text-neutral-600">Página não encontrada</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-button bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-all duration-400 shadow-sm hover:shadow-hover"
        >
          <Home className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
