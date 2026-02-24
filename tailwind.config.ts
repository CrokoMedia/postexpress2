import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Teal Croko (identidade da marca)
        primary: {
          50: '#e6f7f8',
          100: '#cceff1',
          200: '#99dfe3',
          300: '#66cfd5',
          400: '#33bfc7',
          500: '#0a6e75', // Base color - teal Croko
          600: '#085862',
          700: '#06424a',
          800: '#042c31',
          900: '#021619',
        },
        // Secondary: Roxo escuro (adcreative.ai)
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c3b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#1E1541', // Dark purple from adcreative.ai
        },
        // Neutral: Warm Neutral (clean, profissional)
        neutral: {
          50: '#fafaf9',  // Background
          100: '#f5f5f4', // Subtle background
          200: '#e7e5e4', // Border padrão (mais evidente)
          300: '#d6d3d1', // Border strong
          400: '#a8a29e',
          500: '#78716c', // Text muted
          600: '#57534e', // Text secondary
          700: '#44403c',
          750: '#383838',
          800: '#292524',
          850: '#1c1917', // Text primary
          900: '#1a1a1a', // Dark bg
          950: '#0a0a0a',
        },
        // Success: Verde Croko
        success: {
          50: '#f0fdf5',
          100: '#e6f9ed',
          200: '#c1e1c2', // Verde claro Croko
          300: '#9dd9a3',
          400: '#78d184',
          500: '#57cc99', // Verde médio Croko
          600: '#46a37a',
          700: '#347a5c',
          800: '#23513d',
          900: '#11291f',
        },
        // Warning: Amber scale completa
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Error: Red scale completa
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Info: Blue scale completa
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Sofia Pro', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '0.5rem',     // 8px - cards (menos arredondado)
        button: '0.375rem', // 6px - buttons (menos arredondado)
        modal: '0.5rem',    // 8px - modals
        badge: '0.25rem',   // 4px - badges
        input: '0.375rem',  // 6px - inputs
      },
      boxShadow: {
        // Removido: glow colorido (não profissional)
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',  // Elevação suave
        hover: '0 2px 8px 0 rgb(0 0 0 / 0.08)', // Hover sutil
        lg: '0 8px 24px 0 rgb(0 0 0 / 0.12)',   // Elevação forte
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
        fadeIn: 'fadeIn 0.3s ease',
        slideUp: 'slideUp 0.4s ease',
      },
      transitionDuration: {
        '400': '400ms', // AdCreative.ai style (0.3s-0.55s)
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
