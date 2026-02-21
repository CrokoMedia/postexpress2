'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './button'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle - Botão para alternar entre temas
 * Light → Dark → System (ciclo)
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0"
        aria-label="Alternar tema"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  // Determinar qual ícone mostrar
  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-9 h-9 p-0"
      aria-label={`Tema atual: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}. Clique para alternar.`}
      title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}`}
    >
      {theme === 'system' ? (
        <Monitor className="h-4 w-4" />
      ) : currentTheme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
