'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

function useCountUp(target: number, duration = 2000): { ref: RefObject<HTMLDivElement | null>; value: number } {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, value }
}

function StatCard({ target, prefix, suffix, label, delay }: {
  target: number
  prefix?: string
  suffix?: string
  label: string
  delay: number
}) {
  const { ref, value } = useCountUp(target)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center space-y-2 p-6 rounded-xl bg-neutral-800/30 border border-neutral-800/50"
    >
      <p className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
        {prefix}{value.toLocaleString('pt-BR')}{suffix}
      </p>
      <p className="text-sm text-neutral-500">{label}</p>
    </motion.div>
  )
}

const comparisonRows = [
  { item: 'Auditoria de perfil', trad: 'R$ 500-2.000 (1 análise)', pe: 'Ilimitadas' },
  { item: 'Leitura dos slides', trad: 'Não faz', pe: 'Todo o texto extraído' },
  { item: 'Análise de comentários', trad: 'Superficial', pe: 'Milhares categorizados' },
  { item: 'Frameworks científicos', trad: 'Opinião pessoal', pe: '5 autoridades mundiais' },
  { item: 'Tempo de entrega', trad: '3-7 dias', pe: '3 minutos' },
  { item: 'Implementação', trad: '\u201cSe vira\u201d', pe: 'Feita com você' },
]

export function ProofSection() {
  return (
    <section className="relative py-24 lg:py-32 px-6 bg-neutral-900 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-widest uppercase text-primary-400 text-center"
        >
          Os Números Não Mentem
        </motion.p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard target={10000} prefix="+" label="posts analisados" delay={0} />
          <StatCard target={85} suffix="%" label="acerto leitura de slides" delay={0.1} />
          <StatCard target={3} suffix=" min" label="por auditoria" delay={0.2} />
          <StatCard target={5} label="frameworks científicos" delay={0.3} />
          <StatCard target={10} suffix="+" label="nichos testados" delay={0.4} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center space-y-2 p-6 rounded-xl bg-neutral-800/30 border border-neutral-800/50"
          >
            <p className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
              R$ 0,55
            </p>
            <p className="text-sm text-neutral-500">por auditoria</p>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-bold text-neutral-50 text-center">
            O que consultores cobram vs. o que você recebe
          </h3>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700 bg-neutral-900/50">
                  <th className="text-left py-3 px-4 text-sm text-neutral-500 font-medium" />
                  <th className="text-left py-3 px-4 text-sm text-neutral-500 font-medium">
                    Consultor Tradicional
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">
                    Croko Lab
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? 'bg-neutral-800/20' : ''}>
                    <td className="py-3 px-4 text-sm font-semibold text-neutral-300">
                      {row.item}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-500">
                      <span className="inline-flex items-center gap-2">
                        <X className="h-4 w-4 text-error-500 shrink-0" />
                        {row.trad}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-200 bg-primary-500/5">
                      <span className="inline-flex items-center gap-2">
                        <Check className="h-4 w-4 text-success-500 shrink-0" />
                        {row.pe}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Before/After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-error-500/5 border border-error-500/20 rounded-2xl p-8 space-y-4"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-error-500">
              Antes
            </p>
            <p className="text-neutral-300 leading-relaxed italic">
              &ldquo;Acordo, abro o Instagram, fico 4 horas olhando concorrentes sem
              saber o que fazer. Posto algo morno. Zero engajamento. Repito amanhã.&rdquo;
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-success-500/5 border border-success-500/20 rounded-2xl p-8 space-y-4"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-success-500">
              Depois
            </p>
            <p className="text-neutral-300 leading-relaxed italic">
              &ldquo;Abro meu calendário. Já sei o que postar. A estrutura do
              carrossel está pronta. O hook já foi testado no meu nicho. Posto em
              30 minutos. Engajamento real. Crescimento consistente.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
