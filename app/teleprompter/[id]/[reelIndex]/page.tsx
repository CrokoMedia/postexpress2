'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Copy, Check, X, Mic } from 'lucide-react'

export default function TeleprompterPage() {
  const params = useParams()
  const id = params.id as string
  const reelIndex = parseInt(params.reelIndex as string, 10)

  const [reel, setReel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/audits/${id}/content`)
        if (res.ok) {
          const data = await res.json()
          const found = data.reels?.reels?.[reelIndex]
          if (found) setReel(found)
        }
      } catch (err) {
        console.error('Erro ao carregar reel:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, reelIndex])

  const handleCopy = () => {
    if (!reel) return
    const text = [
      `🎙 "${reel.hook_verbal}"`,
      ``,
      ...reel.topicos.map((t: string, i: number) => `${i + 1}. ${t}`),
      ``,
      `✅ ${reel.cta_final}`
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neutral-400 text-lg">Carregando...</div>
      </div>
    )
  }

  if (!reel) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400 text-lg">Reel não encontrado.</p>
        <button
          onClick={() => window.close()}
          className="text-neutral-500 hover:text-white text-sm underline"
        >
          Fechar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Barra de controles */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-neutral-400 text-sm font-medium">{reel.titulo}</span>
          <span className="text-xs text-neutral-700">•</span>
          <span className="text-xs text-neutral-600">{reel.duracao_sugerida}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-sm transition-all border border-neutral-800"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-green-400" />Copiado!</>
            ) : (
              <><Copy className="w-4 h-4" />Copiar Tópicos</>
            )}
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-white text-sm transition-all border border-neutral-800"
          >
            <X className="w-4 h-4" />
            Fechar
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 max-w-3xl mx-auto w-full gap-12">

        {/* Hook */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-neutral-700 text-xs font-semibold uppercase tracking-widest">
            <Mic className="w-3.5 h-3.5" />
            Começa assim
          </div>
          <p className="text-3xl md:text-4xl font-bold text-white leading-tight">
            &ldquo;{reel.hook_verbal}&rdquo;
          </p>
        </div>

        <div className="border-t border-neutral-900" />

        {/* Tópicos */}
        <div className="space-y-5">
          <div className="text-neutral-700 text-xs font-semibold uppercase tracking-widest">
            Tópicos
          </div>
          <ol className="space-y-6">
            {reel.topicos?.map((topico: string, i: number) => (
              <li key={i} className="flex items-start gap-5">
                <span className="text-purple-500 text-3xl font-bold leading-tight flex-shrink-0 w-10">
                  {i + 1}.
                </span>
                <p className="text-2xl md:text-3xl text-neutral-100 leading-snug">
                  {topico}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-neutral-900" />

        {/* CTA */}
        <div className="space-y-3">
          <div className="text-neutral-700 text-xs font-semibold uppercase tracking-widest">
            Finaliza com
          </div>
          <p className="text-2xl md:text-3xl text-green-400 font-semibold leading-tight">
            {reel.cta_final}
          </p>
        </div>

        {/* Dica de gravação */}
        {reel.dica_gravacao && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl px-5 py-4">
            <p className="text-neutral-500 text-sm">
              <span className="text-yellow-500 font-semibold">💡 Dica:</span>{' '}
              {reel.dica_gravacao}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
