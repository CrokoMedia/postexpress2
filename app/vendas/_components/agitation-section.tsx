'use client'

import { motion } from 'framer-motion'

const lies = [
  {
    number: '#1',
    title: '\u201cPreciso de mais métricas\u201d',
    body: 'Você já tem Metricool. Tem Iconosquare. Tem dashboard bonito com gráficos coloridos. E continua sem saber o que postar. Porque métricas não te dizem O QUE fazer. Te dizem o que JÁ aconteceu. É como dirigir olhando pelo retrovisor.',
    punchline: 'Você não precisa de mais métricas. Precisa de direção.',
  },
  {
    number: '#2',
    title: '\u201cConsultoria humana resolve\u201d',
    body: 'Você contrata um consultor. Paga R$ 500, R$ 1.000, às vezes R$ 2.000. Ele olha seu perfil. Faz uma \u201canálise humanizada\u201d em 3 dias. Mas ele NÃO lê o texto dentro dos slides. NÃO analisa milhares de comentários. NÃO aplica frameworks científicos.',
    punchline: 'Ele te dá opinião. Você precisa de dados.',
  },
  {
    number: '#3',
    title: '\u201cSe eu postar mais, vai funcionar\u201d',
    body: 'A estratégia do desespero: postar todo dia, qualquer coisa, e torcer. Você queima a audiência. Posta conteúdo morno. O algoritmo percebe que ninguém se interessa. E te mostra pra menos gente.',
    punchline: 'Postar mais sem saber O QUE postar é como acelerar um carro sem volante.',
  },
]

export function AgitationSection() {
  return (
    <section className="relative py-24 lg:py-32 px-6 bg-neutral-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary-500/5 blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-widest uppercase text-primary-400 text-center"
        >
          Por Que Tudo Que Você Já Tentou Falhou
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.15] text-neutral-50 text-center"
        >
          As 3 Mentiras Que Te Mantêm Travado
        </motion.h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lies.map((lie, i) => (
            <motion.div
              key={lie.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-8 space-y-4 hover:border-primary-500/30 hover:bg-neutral-800 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]"
            >
              <span className="block text-5xl lg:text-6xl font-bold bg-gradient-to-b from-primary-400/30 to-transparent bg-clip-text text-transparent">
                {lie.number}
              </span>
              <h3 className="text-xl lg:text-2xl font-bold text-neutral-50">
                {lie.title}
              </h3>
              <p className="text-base text-neutral-400 leading-relaxed">
                {lie.body}
              </p>
              <p className="text-sm font-semibold text-primary-300">
                {lie.punchline}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Seth Godin quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-lg lg:text-xl italic text-primary-300 max-w-2xl mx-auto">
            &ldquo;Num mundo de vacas marrons, só a vaca roxa é notada.&rdquo;
          </p>
          <p className="text-sm text-neutral-500 mt-2">— Seth Godin</p>
        </motion.div>
      </div>
    </section>
  )
}
