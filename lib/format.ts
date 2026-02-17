/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format date to relative time (Há X dias)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `Há ${diffInDays} dias`
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
  return d.toLocaleDateString('pt-BR')
}

/**
 * Format score (0-100) to classification
 */
export function getScoreClassification(score: number): {
  label: string
  color: string
} {
  if (score >= 90) return { label: 'EXTRAORDINÁRIO', color: 'text-success-500' }
  if (score >= 75) return { label: 'EXCELENTE', color: 'text-success-500' }
  if (score >= 60) return { label: 'BOM', color: 'text-warning-500' }
  if (score >= 40) return { label: 'MEDIANO', color: 'text-warning-500' }
  if (score >= 20) return { label: 'RUIM', color: 'text-error-500' }
  return { label: 'CRÍTICO', color: 'text-error-500' }
}
