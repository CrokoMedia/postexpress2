'use client'

import { Lock, ShieldCheck, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const timeline = [
  { label: 'Dia 0', desc: 'Acesso imediato ao sistema' },
  { label: 'Semana 1', desc: 'Auditoria Profunda completa' },
  { label: 'Semana 2', desc: 'Estratégia de 90 Dias + Templates' },
  { label: 'Semana 3-4', desc: '4 sessões de implementação ao vivo' },
]

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 blur-[150px]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50 text-center"
        >
          A Decisão Que Separa{' '}
          <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
            Estrategistas de Achistas
          </span>
        </motion.h2>

        {/* Option A/B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-error-500/5 border border-error-500/10 rounded-2xl p-8 space-y-4 opacity-60"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-error-500">
              Opção A: Não fazer nada
            </p>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Fechar esta página. Voltar ao Instagram. Olhar a tela em branco. Postar algo
              morno. Repetir amanhã. E no mês que vem. E no próximo ano.
            </p>
            <p className="text-neutral-500 text-sm italic">
              Daqui a 12 meses, você estará exatamente onde está hoje — mas seus
              concorrentes estarão 12 meses à frente.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-success-500/5 border-2 border-success-500/20 rounded-2xl p-8 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-success-500">
              Opção B: Decidir agora
            </p>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Implementar o sistema. Ter 90 dias de conteúdo planejado. Saber exatamente o
              que seu público quer. Parar de adivinhar. Começar a crescer com dados.
            </p>
            <p className="text-neutral-200 text-sm font-medium">
              Daqui a 12 meses, você será o creator que opera com inteligência —
              enquanto outros ainda adivinham.
            </p>
          </motion.div>
        </div>

        {/* Urgency badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-error-500/10 border border-error-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error-500" />
            </span>
            <span className="text-sm font-medium text-error-500">
              Vagas limitadas: apenas 20 implementações por mês
            </span>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <p className="text-2xl lg:text-[32px] text-neutral-500 line-through decoration-neutral-600">
            R$ 35.225
          </p>
          <p className="text-5xl lg:text-[72px] font-bold bg-gradient-to-r from-primary-400 via-white to-primary-400 bg-clip-text text-transparent leading-none bg-[length:200%_auto] animate-gradient">
            R$ 8.888
          </p>

          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex h-16 px-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-lg font-bold text-white shadow-[0_0_80px_rgba(168,85,247,0.4)] hover:shadow-[0_0_120px_rgba(168,85,247,0.6)] transition-shadow duration-300 w-full max-w-md mx-auto"
          >
            GARANTIR MINHA VAGA AGORA &rarr;
          </motion.a>

          <div className="flex items-center justify-center gap-4 text-sm text-neutral-500 flex-wrap">
            <span>12x de R$ 740,67</span>
            <span className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Seguro
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Garantia
            </span>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-neutral-50 text-center">
            O que acontece quando você clica
          </h3>
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-5 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary-500/50 via-primary-500/30 to-primary-500/50" />

            {timeline.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center space-y-3"
              >
                <div className="flex items-center justify-center">
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-primary-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                    <CheckCircle className="h-5 w-5 text-primary-400" />
                  </div>
                </div>
                <p className="text-sm font-bold text-primary-300">{step.label}</p>
                <p className="text-xs text-neutral-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl lg:text-2xl font-bold text-center bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent"
        >
          De &ldquo;achista inseguro&rdquo; para &ldquo;estrategista data-driven&rdquo; em 30 dias.
        </motion.p>
      </div>
    </section>
  )
}
