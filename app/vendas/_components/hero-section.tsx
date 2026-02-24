'use client'

import { ChevronDown, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse [animation-delay:1s]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/5 text-sm text-primary-300 backdrop-blur-sm"
        >
          <Star className="h-4 w-4 fill-primary-400 text-primary-400" />
          <span>Método científico validado por especialistas do Vale do Silício</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.1] text-neutral-50"
        >
          Seus concorrentes já sabem exatamente o que postar.{' '}
          <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Você ainda está adivinhando?
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          Descubra o método que transforma creators travados em estrategistas
          que nunca mais ficam sem ideia de conteúdo — e por que consultores
          cobram R$ 2.000 para fazer o que agora leva 3 minutos.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-3"
        >
          <a
            href="#pricing"
            className="group inline-flex h-14 px-8 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-base font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_80px_rgba(168,85,247,0.5)] hover:scale-[1.03] transition-all duration-300"
          >
            QUERO MINHA IMPLEMENTAÇÃO
            <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </a>
          <p className="text-sm text-neutral-500">
            12x de R$ 740,67 ou R$ 8.888 à vista
          </p>
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="border-l-2 border-primary-500 pl-4 text-left max-w-xl mx-auto"
        >
          <p className="text-neutral-400 italic">
            &ldquo;Eles têm dados. Você tem achismo.&rdquo;
          </p>
          <p className="text-neutral-400 italic mt-1">Isso acaba hoje.</p>
        </motion.blockquote>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6 text-neutral-600" />
        </motion.div>
      </motion.div>
    </section>
  )
}
