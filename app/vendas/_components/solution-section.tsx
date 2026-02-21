'use client'

import { useState } from 'react'
import { Search, Brain, Rocket, Check, BookOpen, BarChart3, DollarSign, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const phases = [
  {
    number: 1,
    title: 'Raio-X do Nicho',
    icon: Search,
    items: [
      'Leitura completa dos slides de DENTRO de cada carrossel',
      'Mapeamento de perguntas do público nos comentários',
      'Análise de padrões de estruturas, hooks e formatos',
    ],
  },
  {
    number: 2,
    title: '5 Frameworks',
    icon: Brain,
    items: [
      'Kahneman (Nobel): comportamento e gatilhos emocionais',
      'Schwartz: níveis de consciência e copy',
      'Hormozi: CTAs, ofertas e value equation',
      'Cagan: outcomes vs. outputs, métricas que importam',
      'Graham: padrões contraintuitivos e anomalias',
    ],
  },
  {
    number: 3,
    title: 'Implementação',
    icon: Rocket,
    items: [
      'Calendário editorial de 90 dias baseado em dados reais',
      '30 ideias de conteúdo validadas (não por "feeling")',
      'Templates de carrossel + scripts de CTA otimizados',
      'Treinamento para replicar o processo sozinho',
    ],
  },
]

const frameworks = [
  { icon: Brain, name: 'Kahneman', title: 'Nobel de Economia', desc: 'Comportamento, vieses, gatilhos' },
  { icon: BookOpen, name: 'Schwartz', title: 'Breakthrough Advertising', desc: 'Copy, hooks, awareness' },
  { icon: DollarSign, name: 'Hormozi', title: '$100M Offers', desc: 'CTAs, ofertas, value equation' },
  { icon: BarChart3, name: 'Cagan', title: 'Inspired (SV)', desc: 'Outcomes vs. vanity metrics' },
  { icon: Lightbulb, name: 'Graham', title: 'Y Combinator', desc: 'Padrões contraintuitivos' },
]

const comparison = [
  { label: 'Resultado', pe: 'Estrategista data-driven + 90 dias planejados', trad: 'PDF com sugestões genéricas' },
  { label: 'Probabilidade', pe: 'Ciência (5 frameworks + dados reais)', trad: 'Opinião (1 pessoa, 1 perspectiva)' },
  { label: 'Tempo', pe: '3 minutos por auditoria', trad: '3-7 dias por auditoria' },
  { label: 'Esforço', pe: 'Feito COM você (implementação guiada)', trad: 'Feito POR VOCÊ (se vira)' },
]

export function SolutionSection() {
  const [activePhase, setActivePhase] = useState(0)
  const phase = phases[activePhase]
  const Icon = phase.icon

  return (
    <section className="relative py-24 lg:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-primary-400">
            O Método Post Express
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50">
            Consultoria Post Express&trade;
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-400">
            Implementação Completa
          </p>
        </motion.div>

        {/* Phase stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8"
        >
          {/* Tabs */}
          <div className="flex lg:flex-col gap-2">
            {phases.map((p, i) => (
              <button
                key={p.number}
                onClick={() => setActivePhase(i)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 w-full',
                  activePhase === i
                    ? 'bg-primary-500/10 border border-primary-500/30 text-primary-300 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                    : 'text-neutral-400 hover:bg-neutral-800/50 border border-transparent'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-all duration-300',
                    activePhase === i
                      ? 'bg-primary-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-neutral-800 text-neutral-400'
                  )}
                >
                  {p.number}
                </span>
                <span className="text-sm font-medium">{p.title}</span>
              </button>
            ))}
          </div>

          {/* Active phase content */}
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8 lg:p-10 space-y-6"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10">
              <Icon className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-2xl lg:text-[28px] font-bold text-neutral-50">
              {phase.title}
            </h3>
            <ul className="space-y-3">
              {phase.items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500/20 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary-400" />
                  </div>
                  <span className="text-neutral-300">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Frameworks grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {frameworks.map((fw, i) => (
            <motion.div
              key={fw.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 text-center hover:border-primary-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)] space-y-3"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/10 mx-auto group-hover:bg-primary-500/20 transition-colors">
                <fw.icon className="h-5 w-5 text-primary-400" />
              </div>
              <p className="text-sm font-bold text-neutral-50">{fw.name}</p>
              <p className="text-xs text-neutral-500">{fw.title}</p>
              <p className="text-xs text-neutral-400">{fw.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xl lg:text-2xl font-bold text-primary-300 text-center"
        >
          É como ter 5 consultores de R$ 10.000/mês analisando seu perfil ao mesmo tempo.
        </motion.p>

        {/* Value Equation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-center">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 text-center space-y-2 max-w-sm shadow-[0_0_30px_rgba(168,85,247,0.06)]">
              <p className="text-sm text-neutral-500 uppercase tracking-wide">
                Value Equation (Hormozi)
              </p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-success-500">
                  Resultado &times; Probabilidade
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mx-8" />
                <p className="text-lg font-semibold text-neutral-500">
                  Tempo &times; Esforço
                </p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700 bg-neutral-900/50">
                  <th className="text-left py-3 px-4 text-sm text-neutral-500 font-medium" />
                  <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">
                    Post Express
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-neutral-500 font-medium">
                    Consultoria Tradicional
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-neutral-800/20' : ''}>
                    <td className="py-3 px-4 text-sm font-semibold text-neutral-300">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-200 bg-primary-500/5">
                      {row.pe}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-500">{row.trad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
