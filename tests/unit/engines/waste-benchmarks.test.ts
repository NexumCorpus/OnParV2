import { describe, it, expect } from 'vitest'
import { compareToBenchmarks, INDUSTRY_BENCHMARKS } from '@/lib/engines/waste-benchmarks'

describe('Waste Benchmarks Engine', () => {
  describe('compareToBenchmarks', () => {
    it('returns excellent when userRate <= bestInClass', () => {
      const result = compareToBenchmarks([{ category: 'Produce', wasteRate: 4.0 }])
      expect(result[0].rating).toBe('excellent')
    })

    it('returns good when userRate <= (bestInClass + average) / 2', () => {
      // Produce: bestInClass=5, average=12, midpoint=8.5
      const result = compareToBenchmarks([{ category: 'Produce', wasteRate: 7.0 }])
      expect(result[0].rating).toBe('good')
    })

    it('returns average when userRate <= average', () => {
      const result = compareToBenchmarks([{ category: 'Produce', wasteRate: 11.0 }])
      expect(result[0].rating).toBe('average')
    })

    it('returns below_average when userRate <= average * 1.5', () => {
      // Produce: average=12, 1.5x=18
      const result = compareToBenchmarks([{ category: 'Produce', wasteRate: 15.0 }])
      expect(result[0].rating).toBe('below_average')
    })

    it('returns poor when userRate > average * 1.5', () => {
      const result = compareToBenchmarks([{ category: 'Produce', wasteRate: 20.0 }])
      expect(result[0].rating).toBe('poor')
    })

    it('handles multiple categories', () => {
      const result = compareToBenchmarks([
        { category: 'Produce', wasteRate: 4.0 },
        { category: 'Dairy', wasteRate: 10.0 },
        { category: 'Bakery', wasteRate: 25.0 },
      ])
      expect(result).toHaveLength(3)
      expect(result[0].rating).toBe('excellent')
      expect(result[1].rating).toBe('below_average')
      expect(result[2].rating).toBe('poor')
    })

    it('includes correct industryAverage and bestInClass', () => {
      const result = compareToBenchmarks([{ category: 'Meat', wasteRate: 5.0 }])
      expect(result[0].industryAverage).toBe(6.0)
      expect(result[0].bestInClass).toBe(2.5)
    })

    it('handles unknown category with defaults', () => {
      const result = compareToBenchmarks([{ category: 'Unknown', wasteRate: 3.0 }])
      expect(result).toHaveLength(1)
      // Should use defaults
      expect(result[0].industryAverage).toBe(5.0)
      expect(result[0].bestInClass).toBe(2.0)
    })

    it('returns empty array for empty input', () => {
      const result = compareToBenchmarks([])
      expect(result).toHaveLength(0)
    })

    it('has benchmarks for all expected categories', () => {
      const expectedCategories = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Pantry', 'Beverages', 'Frozen']
      for (const cat of expectedCategories) {
        expect(INDUSTRY_BENCHMARKS[cat]).toBeDefined()
        expect(INDUSTRY_BENCHMARKS[cat].average).toBeGreaterThan(0)
        expect(INDUSTRY_BENCHMARKS[cat].bestInClass).toBeGreaterThan(0)
        expect(INDUSTRY_BENCHMARKS[cat].bestInClass).toBeLessThan(INDUSTRY_BENCHMARKS[cat].average)
      }
    })
  })
})
