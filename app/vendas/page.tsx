import type { Metadata } from 'next'
import { StickyNav } from './_components/sticky-nav'
import { HeroSection } from './_components/hero-section'
import { ProblemSection } from './_components/problem-section'
import { AgitationSection } from './_components/agitation-section'
import { SolutionSection } from './_components/solution-section'
import { ProofSection } from './_components/proof-section'
import { PricingSection } from './_components/pricing-section'
import { FAQSection } from './_components/faq-section'
import { CTASection } from './_components/cta-section'
import { FooterSection } from './_components/footer-section'

export const metadata: Metadata = {
  title: 'Croko Lab\u2122 \u2014 Consultoria + Implementa\u00e7\u00e3o | R$ 8.888',
  description:
    'Descubra o m\u00e9todo que transforma creators travados em estrategistas que nunca mais ficam sem ideia de conte\u00fado. Consultoria + Implementa\u00e7\u00e3o completa com 5 frameworks cient\u00edficos.',
  openGraph: {
    title: 'Croko Lab\u2122 \u2014 Consultoria + Implementa\u00e7\u00e3o',
    description:
      'De achista inseguro para estrategista data-driven em 30 dias. Método científico validado por especialistas do Vale do Silício.',
    type: 'website',
  },
}

export default function VendasPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 overflow-x-hidden">
      <StickyNav />
      <HeroSection />
      <ProblemSection />
      <AgitationSection />
      <SolutionSection />
      <ProofSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </main>
  )
}
