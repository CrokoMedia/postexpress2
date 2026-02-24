'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

// Validação de formato HEX
const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, label, className }, ref) => {
    const [hexInput, setHexInput] = React.useState(value)

    // Sync with external value changes
    React.useEffect(() => {
      setHexInput(value)
    }, [value])

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setHexInput(newValue)

      // Só propaga se for válido
      if (isValidHex(newValue)) {
        onChange(newValue)
      }
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setHexInput(newValue)
      onChange(newValue)
    }

    const handleHexBlur = () => {
      // Ao sair do campo, se não for válido, reverte pro valor anterior
      if (!isValidHex(hexInput)) {
        setHexInput(value)
      }
    }

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {label}
          </label>
        )}

        <div className="flex items-center gap-2">
          {/* Preview Circle */}
          <div
            className="w-10 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-600 shadow-sm shrink-0 transition-colors duration-400"
            style={{ backgroundColor: isValidHex(hexInput) ? hexInput : value }}
          />

          {/* HEX Input */}
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            placeholder="#000000"
            maxLength={7}
            className={cn(
              'flex h-10 w-24 rounded-input border px-3 py-2 text-sm font-mono transition-colors duration-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isValidHex(hexInput)
                ? 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'border-error-300 dark:border-error-700 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400'
            )}
          />

          {/* Native Color Input */}
          <input
            type="color"
            value={isValidHex(hexInput) ? hexInput : value}
            onChange={handleColorChange}
            className="w-10 h-10 rounded-input border border-neutral-300 dark:border-neutral-600 cursor-pointer bg-transparent transition-colors duration-400"
          />
        </div>

        {!isValidHex(hexInput) && (
          <p className="text-xs text-error-600 dark:text-error-400">
            Formato HEX inválido (ex: #FF5733)
          </p>
        )}
      </div>
    )
  }
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker }
