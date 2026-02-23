'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-8 transition-all duration-300',
        scrolled
          ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50'
          : 'bg-transparent'
      )}
    >
      <span className="text-lg font-bold text-neutral-50">
        Croko Lab<span className="text-primary-400">&trade;</span>
      </span>
      <a
        href="#pricing"
        className={cn(
          'hidden sm:inline-flex h-10 px-6 items-center justify-center rounded-lg text-sm font-medium transition-all',
          scrolled
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'text-neutral-400 hover:text-neutral-50'
        )}
      >
        Garantir Minha Vaga
      </a>
    </nav>
  )
}
