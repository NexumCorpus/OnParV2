import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatRelativeDate,
  formatNumber,
} from '@/lib/utils/formatting'

describe('Formatting Utils', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts as USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-$50.00')
    })
  })

  describe('formatPercentage', () => {
    it('formats with default 1 decimal', () => {
      expect(formatPercentage(75.123)).toBe('75.1%')
    })

    it('formats with custom decimals', () => {
      expect(formatPercentage(33.3333, 2)).toBe('33.33%')
    })

    it('formats zero', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })
  })

  describe('formatDate', () => {
    it('formats a valid date string', () => {
      const result = formatDate('2025-03-15')
      expect(result).toBe('Mar 15, 2025')
    })

    it('returns dash for null', () => {
      expect(formatDate(null)).toBe('\u2014')
    })

    it('returns dash for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('\u2014')
    })
  })

  describe('formatRelativeDate', () => {
    it('returns a relative string for a valid date', () => {
      const recent = new Date(Date.now() - 60 * 1000).toISOString()
      const result = formatRelativeDate(recent)
      expect(result).toContain('ago')
    })

    it('returns dash for invalid date', () => {
      expect(formatRelativeDate('invalid')).toBe('\u2014')
    })
  })

  describe('formatNumber', () => {
    it('formats with zero decimals by default', () => {
      expect(formatNumber(1234.567)).toBe('1,235')
    })

    it('formats with custom decimals', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
    })

    it('formats zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })
})
