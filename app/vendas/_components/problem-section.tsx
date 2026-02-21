'use client'

import { HelpCircle, LayoutGrid, Zap, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: HelpCircle, text: 'Quais perguntas o público deles faz nos comentários dos concorrentes' },
  { icon: LayoutGrid, text: 'Qual estrutura de carrossel gera mais salvamentos' },
  { icon: Zap, text: 'Qual tipo de hook para o engajamento no nicho deles' },
  { icon: FileText, text: 'O que os concorrentes escrevem dentro dos slides' },
]

export function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-widest uppercase text-primary-400"
        >
          O Problema Que Ninguém Te Conta
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50"
        >
          O seu problema não é falta de criatividade.
        </motion.h2>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 text-lg text-neutral-400 leading-relaxed"
        >
          <p>
            O mercado inteiro te convenceu de que você precisa ser &ldquo;mais
            criativo&rdquo;, &ldquo;postar mais&rdquo;, &ldquo;ter mais ideias&rdquo;.
            Mas a verdade contraintuitiva é:
          </p>
          <p className="text-xl font-semibold text-neutral-200">
            Você não precisa de mais ideias. Você precisa das ideias certas.
          </p>
          <p>
            Pense nisso: os creators que mais crescem no Instagram não são
            os mais criativos. São os que{' '}
            <strong className="text-neutral-200">
              sabem exatamente o que o público deles quer ouvir
            </strong>{' '}
            — porque eles têm acesso a dados que você não tem.
          </p>
        </motion.div>

        {/* Feature list */}
        <div className="space-y-4">
          <p className="text-lg text-neutral-300">Eles sabem:</p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 shrink-0">
                  <f.icon className="h-4 w-4 text-primary-400" />
                </div>
                <span className="text-neutral-300 mt-1">{f.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-lg text-neutral-400"
        >
          E enquanto eles operam com essa vantagem injusta de informação...{' '}
          <strong className="text-neutral-200">
            Você está no escuro. Operando no achismo. Postando e rezando.
          </strong>
        </motion.p>

        {/* Blockquote */}
        <motion.blockquote
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-neutral-900 border-l-4 border-primary-500 p-8 rounded-r-xl"
        >
          <p className="text-lg text-neutral-300 italic leading-relaxed">
            &ldquo;Se você pudesse ler cada slide de cada carrossel dos seus
            concorrentes... ouvir cada pergunta que seu público faz... e ter 5
            dos maiores especialistas do mundo analisando tudo isso POR VOCÊ...
            quanto vale isso para o seu negócio?&rdquo;
          </p>
          <p className="text-neutral-200 font-semibold mt-4">
            A resposta honesta: vale tudo.
          </p>
        </motion.blockquote>
      </div>
    </section>
  )
}
