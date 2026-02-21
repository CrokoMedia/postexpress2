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
        // Primary: Rosa/Magenta (adcreative.ai inspired)
        primary: {
          50: '#fef2f7',
          100: '#fde6ef',
          200: '#fccfdf',
          300: '#faa7c3',
          400: '#f7749d',
          500: '#ef2b70', // Base color from adcreative.ai
          600: '#d91f5e',
          700: '#b7164c',
          800: '#981645',
          900: '#80173e',
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
        // Neutral: Light mode (brancos/cinzas claros)
        neutral: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
          950: '#171717',
        },
        // Success: Green scale completa
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
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
        card: '0.75rem',    // 12px - cards
        button: '0.5rem',   // 8px - buttons
        modal: '1rem',      // 16px - modals (adcreative.ai)
        badge: '0.375rem',  // 6px - badges
        input: '0.5rem',    // 8px - inputs
      },
      boxShadow: {
        glow: '0 0 20px rgb(239 43 112 / 0.2)', // Rosa/Magenta glow
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Suave e sutil
        hover: '0 4px 8px 0 rgb(0 0 0 / 0.08)', // Hover suave
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
