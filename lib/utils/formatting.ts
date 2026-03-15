import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = parseISO(dateString)
  if (!isValid(date)) return '—'
  return format(date, 'MMM d, yyyy')
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString)
  if (!isValid(date)) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
  }).format(value)
}
