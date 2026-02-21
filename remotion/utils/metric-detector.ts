/**
 * Metric detection utility for Remotion slides.
 * Scans slide text for numbers, scores, percentages, and other
 * quantitative data that can be rendered as animated visualizations.
 */

export interface MetricDetection {
  /** Type of metric detected */
  type: 'score' | 'percentage' | 'number'
  /** Numeric value extracted */
  value: number
  /** Maximum value (for scores like 85/100) */
  max?: number
  /** Display suffix (%, /100, k, etc.) */
  suffix?: string
  /** Original matched string from the text */
  original: string
}

/**
 * Detects metrics in slide text using regex patterns.
 * Returns an array of MetricDetection objects for each match found.
 *
 * Patterns matched (in priority order):
 * 1. Score: "85/100", "7/10" -> type: 'score'
 * 2. Percentage: "3.5%", "85%" -> type: 'percentage'
 * 3. Large number with k suffix: "10k", "2.5k" -> type: 'number'
 * 4. Standalone significant number: "85", "3.5" -> type: 'number'
 *
 * Deliberately conservative to avoid false positives on slide/page
 * numbers, dates, or other non-metric numbers.
 */
export function detectMetrics(text: string): MetricDetection[] {
  if (!text || typeof text !== 'string') return []

  const results: MetricDetection[] = []
  const matchedRanges: Array<[number, number]> = []

  // Helper: check if a position range has already been matched
  const isAlreadyMatched = (start: number, end: number): boolean => {
    return matchedRanges.some(
      ([s, e]) => (start >= s && start < e) || (end > s && end <= e)
    )
  }

  // Pattern 1: Score format — "85/100", "7/10", "9.5/10"
  const scoreRegex = /(\d+(?:\.\d+)?)\/(\d+)/g
  let match: RegExpExecArray | null

  match = scoreRegex.exec(text)
  while (match !== null) {
    const start = match.index
    const end = start + match[0].length
    if (!isAlreadyMatched(start, end)) {
      const value = parseFloat(match[1])
      const max = parseFloat(match[2])
      // Only match reasonable score ranges (avoid dates like 01/2026)
      if (max >= 2 && max <= 1000 && value <= max) {
        results.push({
          type: 'score',
          value,
          max,
          suffix: `/${max}`,
          original: match[0],
        })
        matchedRanges.push([start, end])
      }
    }
    match = scoreRegex.exec(text)
  }

  // Pattern 2: Percentage — "85%", "3.5%", "100%"
  const percentRegex = /(\d+(?:\.\d+)?)%/g
  match = percentRegex.exec(text)
  while (match !== null) {
    const start = match.index
    const end = start + match[0].length
    if (!isAlreadyMatched(start, end)) {
      const value = parseFloat(match[1])
      if (value >= 0 && value <= 100000) {
        results.push({
          type: 'percentage',
          value,
          max: 100,
          suffix: '%',
          original: match[0],
        })
        matchedRanges.push([start, end])
      }
    }
    match = percentRegex.exec(text)
  }

  // Pattern 3: Number with "k" suffix — "10k", "2.5k"
  const kNumberRegex = /(\d+(?:\.\d+)?)k\b/gi
  match = kNumberRegex.exec(text)
  while (match !== null) {
    const start = match.index
    const end = start + match[0].length
    if (!isAlreadyMatched(start, end)) {
      const value = parseFloat(match[1])
      results.push({
        type: 'number',
        value: value * 1000,
        suffix: 'k',
        original: match[0],
      })
      matchedRanges.push([start, end])
    }
    match = kNumberRegex.exec(text)
  }

  // Pattern 4: Standalone significant numbers — "85", "3.5"
  // Must be preceded by whitespace/start and followed by whitespace/end/punctuation
  // Excludes numbers that look like ordinals (1st, 2nd), dates, or slide numbers
  const standaloneRegex = /(?:^|[\s(])(\d+(?:\.\d+)?)(?=[\s).,;:!?\-]|$)/g
  match = standaloneRegex.exec(text)
  while (match !== null) {
    const numStr = match[1]
    const value = parseFloat(numStr)
    // Calculate actual position of the number within the match
    const numStart = match.index + match[0].indexOf(numStr)
    const numEnd = numStart + numStr.length

    if (!isAlreadyMatched(numStart, numEnd)) {
      // Filter out likely non-metric numbers:
      // - Very small numbers (0, 1, 2) are often not metrics
      // - Numbers that look like years (2020-2030)
      // - Numbers that look like slide numbers (already handled elsewhere)
      const isLikelyMetric =
        value >= 3 &&
        !(value >= 1900 && value <= 2100) && // not a year
        value <= 1000000 // reasonable metric range

      if (isLikelyMetric) {
        results.push({
          type: 'number',
          value,
          suffix: '',
          original: numStr,
        })
        matchedRanges.push([numStart, numEnd])
      }
    }
    match = standaloneRegex.exec(text)
  }

  return results
}
