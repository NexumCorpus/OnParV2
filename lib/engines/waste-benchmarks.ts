// --- Types ---

export interface BenchmarkComparison {
  category: string
  userRate: number
  industryAverage: number
  bestInClass: number
  percentile: number
  rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'
}

// Industry average waste benchmarks by category
export const INDUSTRY_BENCHMARKS: Record<string, { average: number; bestInClass: number }> = {
  'Produce': { average: 12.0, bestInClass: 5.0 },
  'Dairy': { average: 8.0, bestInClass: 3.0 },
  'Meat': { average: 6.0, bestInClass: 2.5 },
  'Seafood': { average: 10.0, bestInClass: 4.0 },
  'Bakery': { average: 15.0, bestInClass: 7.0 },
  'Pantry': { average: 3.0, bestInClass: 1.0 },
  'Beverages': { average: 2.0, bestInClass: 0.5 },
  'Frozen': { average: 4.0, bestInClass: 1.5 },
}

function determineRating(
  userRate: number,
  average: number,
  bestInClass: number
): 'excellent' | 'good' | 'average' | 'below_average' | 'poor' {
  if (userRate <= bestInClass) return 'excellent'
  if (userRate <= (bestInClass + average) / 2) return 'good'
  if (userRate <= average) return 'average'
  if (userRate <= average * 1.5) return 'below_average'
  return 'poor'
}

function calculatePercentile(
  userRate: number,
  average: number,
  bestInClass: number
): number {
  // Lower waste rate = better percentile
  // bestInClass = 95th percentile, average = 50th percentile
  if (userRate <= bestInClass) return 95
  if (userRate <= average) {
    // Interpolate between 50 and 95
    const range = average - bestInClass
    if (range <= 0) return 95
    const position = (average - userRate) / range
    return Math.round(50 + position * 45)
  }
  // Above average: interpolate between 5 and 50
  const worstRate = average * 2
  if (userRate >= worstRate) return 5
  const range = worstRate - average
  if (range <= 0) return 5
  const position = (worstRate - userRate) / range
  return Math.round(5 + position * 45)
}

export function compareToBenchmarks(
  categoryWasteRates: Array<{ category: string; wasteRate: number }>
): BenchmarkComparison[] {
  return categoryWasteRates.map(({ category, wasteRate }) => {
    const benchmark = INDUSTRY_BENCHMARKS[category]
    const industryAverage = benchmark?.average ?? 5.0
    const bestInClass = benchmark?.bestInClass ?? 2.0

    const rating = determineRating(wasteRate, industryAverage, bestInClass)
    const percentile = calculatePercentile(wasteRate, industryAverage, bestInClass)

    return {
      category,
      userRate: wasteRate,
      industryAverage,
      bestInClass,
      percentile,
      rating,
    }
  })
}
