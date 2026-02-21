'use client'

import { useState } from 'react'
import { ChevronDown, Shield, Target, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const faqItems = [
  {
    question: 'Funciona no meu nicho?',
    answer:
      'Testamos em mais de 10 nichos diferentes: fitness, finanças pessoais, marketing digital, relacionamentos, espiritualidade, gastronomia, moda, tecnologia, jurídico e saúde. Os frameworks são universais. Kahneman ganhou o Nobel estudando como todo ser humano toma decisões. A ciência não muda por nicho — os dados mudam, e nós coletamos os dados do SEU nicho.',
  },
  {
    question: 'Já uso Metricool / outra ferramenta de métricas',
    answer:
      'Perfeito. Continue usando. Metricool te mostra o que já aconteceu (alcance, impressões, curtidas). O Post Express te mostra o que fazer agora (quais perguntas seu público faz, quais estruturas de carrossel funcionam, o que seus concorrentes escrevem dentro dos slides). É como a diferença entre um termômetro (mede temperatura) e um médico (diagnostica e trata). Você precisa dos dois. Mas só um resolve o problema.',
  },
  {
    question: 'Posso fazer isso manualmente de graça',
    answer:
      'Pode. Da mesma forma que pode ir a pé de São Paulo ao Rio de Janeiro. Analisar 1 concorrente manualmente: 4 horas. Ler texto de dentro dos slides: impossível sem método. Categorizar milhares de comentários: dias. Aplicar 5 frameworks: precisa conhecer os 5 livros. Ou você usa o Post Express e tem tudo em 3 minutos. A pergunta não é "posso fazer de graça?" É: "Quanto vale meu tempo?"',
  },
  {
    question: 'R$ 8.888 é muito caro',
    answer:
      'Comparado com o quê? 1 mês de agência: R$ 3.000-10.000/mês. 1 consultoria premium: R$ 2.000-5.000 por UMA análise. 1 curso de marketing: R$ 1.997-4.997 (teoria, ZERO implementação). Ficar travado por mais 12 meses: incalculável. R$ 8.888 por uma implementação completa, com 12 meses de acesso, 4 sessões ao vivo, e um sistema que te dá independência total? Não é caro. É a decisão mais barata que você pode tomar pro futuro do seu negócio.',
  },
  {
    question: 'Não tenho certeza se é pra mim',
    answer:
      'É pra você se: você é creator, consultor ou agência e precisa de conteúdo consistente; já tentou "postar mais" e não funcionou; quer parar de adivinhar e decidir com dados; valoriza seu tempo. NÃO é pra você se: quer resultado sem fazer nada (implementamos COM você, não POR você); acha que "feeling" é suficiente; não está disposto a mudar sua forma de criar conteúdo.',
  },
  {
    question: 'E se não funcionar?',
    answer:
      'Temos Garantia Tripla: 30 dias de satisfação (devolução total), 90 dias de resultado (se não gerar 30 ideias validadas, devolvemos tudo + R$ 500 pelo seu tempo), e 12 meses de independência (renovação gratuita se não se sentir preparado). Nós assumimos 100% do risco. Você fica com 100% do resultado.',
  },
]

const guarantees = [
  {
    icon: Shield,
    period: '30 dias',
    title: 'Satisfação',
    desc: 'Devolvemos 100% do valor. Sem perguntas, sem burocracia.',
  },
  {
    icon: Target,
    period: '90 dias',
    title: 'Resultado',
    desc: 'Se não gerar 30 ideias validadas, devolvemos tudo + R$ 500 pelo seu tempo.',
  },
  {
    icon: RefreshCw,
    period: '12 meses',
    title: 'Independência',
    desc: 'Se não se sentir capaz de operar sozinho, renovamos gratuitamente por +6 meses.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-neutral-900 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary-500/5 blur-[120px]" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-primary-400">
            Perguntas Frequentes
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50">
            Tudo que você precisa saber antes de decidir
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 rounded-xl overflow-hidden hover:border-neutral-600/50 transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-base font-semibold text-neutral-50 pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-neutral-400 shrink-0 transition-transform duration-300',
                    openIndex === i && 'rotate-180 text-primary-400'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-neutral-400 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Guarantee cards */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guarantees.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-8 text-center space-y-3 hover:border-primary-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.08)] transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 mx-auto">
                  <g.icon className="h-6 w-6 text-primary-400" />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary-300">
                  {g.period}
                </p>
                <p className="text-lg font-bold text-neutral-50">{g.title}</p>
                <p className="text-sm text-neutral-400">{g.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-1"
          >
            <p className="text-xl lg:text-2xl font-bold text-primary-300">
              Nós assumimos 100% do risco.
            </p>
            <p className="text-xl lg:text-2xl font-bold text-primary-300">
              Você fica com 100% do resultado.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
