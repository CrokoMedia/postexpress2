'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * ThemeProvider usando next-themes
 * - SSR-safe (sem flash de conteúdo)
 * - Detecta preferência do sistema automaticamente
 * - Persiste escolha no localStorage
 * - Transições suaves entre temas
 */
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Re-export useTheme do next-themes para compatibilidade
export { useTheme } from 'next-themes'
