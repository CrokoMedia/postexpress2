'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Badge } from './badge'

export interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  ({ value, onChange, placeholder = 'Adicione tags...', className }, ref) => {
    const [inputValue, setInputValue] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !value.includes(trimmedTag)) {
        onChange([...value, trimmedTag])
      }
      setInputValue('')
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter ou vírgula adiciona tag
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag(inputValue)
      }

      // Backspace com input vazio remove última tag
      if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1])
      }
    }

    const handleBlur = () => {
      // Adiciona tag ao sair do input (se tiver algo digitado)
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    }

    const handleContainerClick = () => {
      inputRef.current?.focus()
    }

    return (
      <div
        ref={ref}
        onClick={handleContainerClick}
        className={cn(
          'flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-input border px-3 py-2 cursor-text transition-colors duration-400',
          'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800',
          'hover:border-primary-500 dark:hover:border-primary-400',
          'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500',
          className
        )}
      >
        {/* Tags */}
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="primary"
            className="group pr-1 cursor-default"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="ml-1 rounded-sm p-0.5 hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 outline-none"
        />
      </div>
    )
  }
)
TagInput.displayName = 'TagInput'

export { TagInput }
