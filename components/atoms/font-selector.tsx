'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

// Google Fonts populares
const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Montserrat',
  'Playfair Display',
  'Lato',
  'Open Sans',
  'Poppins',
  'Raleway',
] as const

const FontSelector = React.forwardRef<HTMLDivElement, FontSelectorProps>(
  ({ value, onChange, label, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    // Load Google Font dynamically
    React.useEffect(() => {
      if (value && !document.querySelector(`link[href*="${value}"]`)) {
        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${value.replace(' ', '+')}:wght@400;500;600;700&display=swap`
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      }
    }, [value])

    const handleSelect = (font: string) => {
      onChange(font)
      setIsOpen(false)
    }

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {label}
          </label>
        )}

        <div className="relative" ref={dropdownRef}>
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-input border px-3 py-2 text-sm transition-colors duration-400',
              'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-neutral-100',
              'hover:border-primary-500 dark:hover:border-primary-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500'
            )}
            style={{ fontFamily: value }}
          >
            <span>{value || 'Selecione uma fonte'}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-input border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg max-h-60 overflow-auto">
              {GOOGLE_FONTS.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => handleSelect(font)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm transition-colors duration-200',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    'focus-visible:outline-none focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-700',
                    value === font
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-neutral-900 dark:text-neutral-100'
                  )}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
FontSelector.displayName = 'FontSelector'

export { FontSelector }
