import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './sofia-pro.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/app/providers/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Post Express - Instagram Audit Dashboard',
  description: 'Sistema de auditoria de perfis do Instagram com 5 auditores especializados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
