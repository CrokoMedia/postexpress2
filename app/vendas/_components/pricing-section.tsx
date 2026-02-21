'use client'

import { Check, Lock, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const stackItems = [
  {
    title: 'Auditoria Profunda Completa',
    value: 'R$ 5.000',
    items: [
      'Raio-X de até 10 concorrentes do seu nicho',
      'Leitura completa dos slides de todos os carrosséis',
      'Mapeamento de todas as perguntas do público',
      'Análise com os 5 frameworks científicos',
      'Relatório de 20+ páginas com insights acionáveis',
    ],
  },
  {
    title: 'Estratégia de Conteúdo de 90 Dias',
    value: 'R$ 8.000',
    items: [
      'Calendário editorial completo (90 dias)',
      '30 ideias de conteúdo validadas por dados',
      'Mix ideal de formatos (carrosséis, reels, stories)',
      'Hooks testados para o seu nicho específico',
      'Sequência de awareness (Schwartz) aplicada',
    ],
  },
  {
    title: 'Templates e Scripts Prontos',
    value: 'R$ 3.000',
    items: [
      '10 templates de carrossel baseados nas estruturas campeãs',
      'Scripts de CTA otimizados (framework Hormozi)',
      'Banco de 100+ hooks que funcionam no seu mercado',
      'Estruturas de copy para cada nível de consciência',
    ],
  },
  {
    title: 'Implementação Guiada (Done-WITH-You)',
    value: 'R$ 12.000',
    items: [
      '4 sessões de implementação ao vivo (1h cada)',
      'Revisão dos seus primeiros 10 conteúdos',
      'Ajustes em tempo real com feedback dos frameworks',
      'Treinamento para você operar o sistema sozinho',
    ],
  },
  {
    title: 'Acesso ao Sistema de Auditorias (12 meses)',
    value: 'R$ 3.564',
    items: [
      '12 meses de acesso ao sistema Post Express Profissional',
      'Auditorias ilimitadas de qualquer perfil',
      'Atualização automática dos frameworks',
      'Novas funcionalidades incluídas',
    ],
  },
]

const bonuses = [
  {
    title: 'Treinamento "Como Vender Auditoria por R$ 500-2.000"',
    value: 'R$ 2.000',
    desc: 'Aula de 90 minutos + scripts de venda prontos + template de proposta comercial',
  },
  {
    title: 'Comunidade VIP de Estrategistas Data-Driven',
    value: 'R$ 1.164',
    desc: 'Acesso exclusivo por 12 meses + encontros mensais + network profissional',
  },
  {
    title: 'Biblioteca de 100 Estruturas de Carrosséis',
    value: 'R$ 497',
    desc: 'Descobertas analisando +10.000 posts, organizadas por nicho e objetivo',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 px-6 scroll-mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_50%)]" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px]" />
      <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-primary-400">
            Tudo Que Está Incluso
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50">
            O Que Você Recebe
          </h2>
        </motion.div>

        {/* Stack cards */}
        <div className="space-y-4">
          {stackItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8 space-y-4 hover:border-primary-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-neutral-50">{item.title}</h3>
                <span className="text-sm text-neutral-500 shrink-0 font-medium bg-neutral-800 px-3 py-1 rounded-full">
                  Valor: {item.value}
                </span>
              </div>
              <ul className="space-y-2">
                {item.items.map((sub, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-neutral-400">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-500/20 shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-primary-400" />
                    </div>
                    <span>{sub}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bonuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-warning-500 text-center">
            Bônus Inclusos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bonuses.map((bonus, i) => (
              <motion.div
                key={bonus.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-6 space-y-2 hover:border-primary-500/40 transition-colors duration-300"
              >
                <p className="text-sm font-bold text-neutral-50">{bonus.title}</p>
                <p className="text-xs text-primary-400 font-medium">Valor: {bonus.value}</p>
                <p className="text-xs text-neutral-400">{bonus.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

        {/* PRICING BLOCK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-primary-500/30 rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-[0_0_80px_rgba(168,85,247,0.15)]"
        >
          {/* Glow effect behind */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary-500/20 to-transparent opacity-50 blur-sm -z-10" />

          <p className="text-2xl lg:text-[32px] text-neutral-500 line-through decoration-neutral-600">
            R$ 35.225
          </p>
          <p className="text-lg text-neutral-400">Seu Investimento Hoje:</p>
          <p className="text-5xl lg:text-[72px] font-bold bg-gradient-to-r from-primary-400 via-white to-primary-400 bg-clip-text text-transparent leading-none bg-[length:200%_auto] animate-gradient">
            R$ 8.888
          </p>
          <p className="text-lg text-neutral-400">
            ou 12x de R$ 740,67
          </p>

          {/* CTA */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex h-16 px-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-lg font-bold text-white shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:shadow-[0_0_100px_rgba(168,85,247,0.6)] transition-shadow duration-300 w-full max-w-md mx-auto"
          >
            QUERO MINHA IMPLEMENTAÇÃO COMPLETA &rarr;
          </motion.a>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Pagamento seguro
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Garantia 30 dias
            </span>
          </div>

          <p className="text-base italic text-neutral-500 max-w-md mx-auto">
            &ldquo;Faça às pessoas uma oferta tão boa que elas se sentiriam idiotas
            dizendo não.&rdquo; — Alex Hormozi
          </p>
        </motion.div>

        {/* ROI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-4 hover:border-primary-500/20 transition-colors duration-300"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-primary-400">
              Se você é consultor ou agência
            </p>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Cada auditoria custa centavos e leva 3 minutos. Cobre R$ 500 por auditoria.{' '}
              <strong className="text-neutral-50">
                2 auditorias/mês = R$ 1.000/mês = R$ 12.000/ano.
              </strong>{' '}
              Seu investimento se paga em menos de 9 meses. O restante é lucro puro.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-4 hover:border-primary-500/20 transition-colors duration-300"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-primary-400">
              Se você é creator solo
            </p>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Quanto vale 4 horas/semana que você recupera? Quanto vale nunca mais travar
              sem saber o que postar? Quanto vale 90 dias de conteúdo planejado?{' '}
              <strong className="text-neutral-50">
                Valor incalculável. Custa menos que 1 mês de consultor tradicional.
              </strong>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
