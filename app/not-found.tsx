import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-500">404</h1>
        <p className="mt-4 text-lg text-gray-400">Página não encontrada</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
