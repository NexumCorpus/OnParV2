# TIER 5: Waste Analysis Engine & AI Insights

## Prerequisites
Tier 4 must be complete: Recipes and menu items working, inventory data flowing.

## Overview
This is the most algorithmically critical tier. It ports all the waste analysis, prediction, and AI insight engines from the original codebase. **ALL FORMULAS BELOW ARE EXACT — do not simplify or approximate.**

This tier builds:
1. Waste event logging (record waste)
2. Waste analysis engine (patterns, risk levels, seasonal trends)
3. Waste prediction engine (30-day forecasting, alerts)
4. Waste insights & benchmarking (reports, recommendations)
5. AI insight generation (optimization algorithms)
6. Waste management page
7. AI insights page

---

## Architecture Note: Engines vs Services

**Engine files** (`lib/engines/`) contain pure business logic functions. They accept data as parameters and return computed results — they do **NOT** import or call Supabase directly.

**Server actions** (`lib/actions/`) are the glue: they fetch data from Supabase, pass it to engine functions, and return results to the UI.

This separation makes engines fully unit-testable without mocking Supabase.

---

## Step 1: Waste Analysis Engine

Create `lib/engines/waste-analysis.ts`:

### Types

```typescript
export interface WastePattern {
  itemId: string
  itemName: string
  category: string
  totalWasteQuantity: number
  totalWasteValue: number
  wasteRate: number           // percentage
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  primaryReason: string
  occurrences: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface WasteSavingsCalculation {
  currentMonthlyWaste: number
  potentialSavings: number
  reductionPercentage: number
  implementationCost: number
  paybackPeriodMonths: number
  roi: number
}

export interface SeasonalTrend {
  month: number
  monthName: string
  wasteMultiplier: number
  historicalAverage: number
}
```

### Core Analysis Functions

```typescript
// Analyze waste patterns from waste_events data
// Groups by inventory item, calculates waste rate per item
// NOTE: This is a PURE function — it accepts data, not userId.
// The server action fetches waste_events and inventory, then calls this.
analyzeWastePatterns(
  wasteEvents: WasteEvent[],
  inventoryItems: InventoryItem[]
): WastePattern[]

// For each item:
//   wasteRate = (totalWasteQuantity / totalInboundQuantity) * 100
//   where totalInboundQuantity is approximated from current quantity + total waste
//
// Risk level determination:
//   'critical': wasteRate > 20 OR totalWasteValue > 500
//   'high':     wasteRate > 10 OR totalWasteValue > 200
//   'medium':   wasteRate > 5  OR totalWasteValue > 50
//   'low':      everything else
//
// Trend: compare last 30 days waste to previous 30 days
//   increasing: current > previous * 1.1
//   decreasing: current < previous * 0.9
//   stable: otherwise
```

### Seasonal Analysis

```typescript
// Monthly seasonal multipliers (1.0 = baseline)
// Based on restaurant industry averages
const SEASONAL_MULTIPLIERS: Record<number, number> = {
  1: 0.95,  // January - post-holiday slowdown
  2: 0.92,  // February - lowest traffic
  3: 0.98,  // March - spring pickup
  4: 1.02,  // April - spring
  5: 1.05,  // May - pre-summer
  6: 1.12,  // June - summer peak starts
  7: 1.15,  // July - peak summer
  8: 1.10,  // August - late summer
  9: 1.03,  // September - back to school
  10: 1.00, // October - baseline
  11: 1.08, // November - holiday prep
  12: 1.18, // December - holiday peak
}

// Pure function — returns seasonal data based on current month
getSeasonalTrends(): SeasonalTrend[]
```

### Savings Calculations

```typescript
// Calculate potential savings from waste reduction
// potentialSavings = currentMonthlyWaste * (reductionPercentage / 100)
// paybackPeriodMonths = implementationCost / potentialSavings
// roi = ((potentialSavings * 12) - implementationCost) / implementationCost * 100
calculateSavings(
  currentMonthlyWaste: number,
  reductionPercentage: number,
  implementationCost: number
): WasteSavingsCalculation
```

---

## Step 2: Waste Prediction Engine

Create `lib/engines/waste-predictions.ts`:

### Types

```typescript
export interface WastePrediction {
  itemId: string
  itemName: string
  predictedWasteQuantity: number
  predictedWasteValue: number
  confidence: number           // 0-100
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  name: string
  impact: number              // multiplier, e.g., 1.2 = 20% increase
  description: string
}

export interface WasteAlert {
  id: string
  type: 'expiration' | 'high_waste_risk' | 'overstock' | 'seasonal_spike'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  itemId?: string
  itemName?: string
  estimatedImpact: number     // dollar value
  suggestedAction: string
  createdAt: Date
}

export interface PreventionROI {
  strategy: string
  monthlySavings: number
  implementationCost: number
  annualSavings: number
  roi: number
  paybackMonths: number
}
```

### Prediction Functions

```typescript
// Generate 30-day waste predictions for all inventory items
// Pure function — accepts data, server action fetches and passes it in
generatePredictions(
  inventoryItems: InventoryItem[],
  wasteEvents: WasteEvent[],
  currentMonth: number
): WastePrediction[]

// For each item:
//   1. Calculate base waste rate from 6 months history
//   2. Apply adjustment factors:
//      - Seasonal factor: SEASONAL_MULTIPLIERS[currentMonth]
//      - Stock level factor:
//          if quantity > max_stock_level * 1.2: factor = 1.3
//          if quantity > max_stock_level: factor = 1.15
//          else: factor = 1.0
//      - Expiration proximity factor:
//          if days_to_expiry < 1: factor = 2.0
//          if days_to_expiry < 3: factor = 1.5
//          if days_to_expiry < 7: factor = 1.2
//          else: factor = 1.0
//      - Recent trend factor:
//          if waste increasing (last 30 > prev 30 * 1.1): factor = 1.2
//          if waste decreasing: factor = 0.85
//          else: factor = 1.0
//   3. predictedWaste = baseWasteRate * product(allFactors) * quantity * price
//   4. Prediction confidence (per-item, simpler than AI insight confidence):
//      confidence = min(95, dataQuality * 100)
//      where dataQuality = min(1, itemWasteEventsCount / 10)
//      NOTE: This is DIFFERENT from AI insight confidence (see ai-insights.ts)
```

### Alert Generation

```typescript
// Generate alerts based on current state and predictions
// Pure function — accepts data
generateAlerts(
  inventoryItems: InventoryItem[],
  predictions: WastePrediction[],
  currentMonth: number
): WasteAlert[]

// Alert types:
//
// EXPIRATION WARNINGS:
//   For each inventory item with expiry_date:
//     days_to_expiry = expiry_date - today
//     if days_to_expiry < 1:
//       severity = 'critical'
//       title = "{name} expires today!"
//     elif days_to_expiry < 2:
//       severity = 'critical'
//       title = "{name} expires tomorrow"
//     elif days_to_expiry < 3:
//       severity = 'high'
//       title = "{name} expires in {days} days"
//     elif days_to_expiry < 7:
//       severity = 'medium'
//       title = "{name} expires in {days} days"
//
// HIGH WASTE RISK:
//   For items with predicted waste value > $50 AND confidence > 70%:
//     severity = predictedValue > $200 ? 'high' : 'medium'
//     title = "High waste risk: {name}"
//
// OVERSTOCK:
//   For items where quantity > max_stock_level * 1.2:
//     severity = 'medium'
//     title = "{name} overstocked by {percentage}%"
//
// SEASONAL SPIKES:
//   Hardcoded category rules:
//     if month in [6,7,8] AND category == 'Dairy': warning about summer spoilage
//     if month in [11,12] AND category == 'Produce': warning about holiday surplus
//     if month in [1,2] AND category == 'Frozen': warning about winter demand drop
```

### Prevention ROI

```typescript
// Calculate ROI for waste prevention strategies
calculatePreventionROI(
  currentMonthlyWaste: number,
  strategy: string,
  expectedReductionPercent: number,
  implementationCost: number
): PreventionROI

// monthlySavings = currentMonthlyWaste * (expectedReductionPercent / 100)
// annualSavings = monthlySavings * 12
// roi = ((annualSavings - implementationCost) / implementationCost) * 100
// paybackMonths = implementationCost / monthlySavings
```

---

## Step 3: Waste Insights & Benchmarking

Create `lib/engines/waste-insights.ts`:

### Types

```typescript
export interface WasteInsightReport {
  userId: string
  generatedAt: Date
  summary: {
    totalWasteValue: number
    highRiskItems: number
    potentialSavings: number
    performanceScore: number     // 0-100
  }
  patterns: WastePattern[]
  recommendations: WasteRecommendation[]
  targets: WasteReductionTarget[]
  seasonalInsights: SeasonalInsight[]
}

export interface WasteRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  expectedSavings: number
  implementationCost: number
  difficulty: 'easy' | 'moderate' | 'challenging'
  timeframe: string
}

export interface WasteReductionTarget {
  category: string
  currentRate: number
  targetRate: number
  timeframe: string
  strategies: string[]
}

export interface SeasonalInsight {
  month: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}
```

### Report Generation

```typescript
// Generate comprehensive waste insight report
// Pure function — orchestrates other engine functions with pre-fetched data
generateReport(data: {
  wastePatterns: WastePattern[]
  benchmarks: BenchmarkComparison[]
  predictions: WastePrediction[]
  avgWasteRate: number
}): WasteInsightReport

// Performance score calculation:
//   score = 100 - (avgWasteRate * 5)
//   Clamped to 0-100
//   Adjusted by: -10 if any critical patterns, -5 per high risk item

// Recommendations generated from patterns:
//   For each pattern with risk >= 'medium':
//     Generate recommendation based on category and reason
//     Sort by expectedSavings descending
```

Create `lib/engines/waste-benchmarks.ts`:

```typescript
export interface BenchmarkComparison {
  category: string
  userRate: number
  industryAverage: number
  bestInClass: number
  percentile: number
  rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'
}

// Industry average waste benchmarks by category
const INDUSTRY_BENCHMARKS: Record<string, { average: number; bestInClass: number }> = {
  'Produce': { average: 12.0, bestInClass: 5.0 },
  'Dairy': { average: 8.0, bestInClass: 3.0 },
  'Meat': { average: 6.0, bestInClass: 2.5 },
  'Seafood': { average: 10.0, bestInClass: 4.0 },
  'Bakery': { average: 15.0, bestInClass: 7.0 },
  'Pantry': { average: 3.0, bestInClass: 1.0 },
  'Beverages': { average: 2.0, bestInClass: 0.5 },
  'Frozen': { average: 4.0, bestInClass: 1.5 },
}

// Rating determination:
//   excellent: userRate <= bestInClass
//   good: userRate <= (bestInClass + average) / 2
//   average: userRate <= average
//   below_average: userRate <= average * 1.5
//   poor: userRate > average * 1.5

// Pure function — accepts waste patterns grouped by category
compareToBenchmarks(categoryWasteRates: Array<{ category: string; wasteRate: number }>): BenchmarkComparison[]
```

---

## Step 4: AI Insight Generation

Create `lib/engines/ai-insights.ts`:

### Insight Generation Algorithms

```typescript
// Generate all AI insights from user data
// Pure function — accepts pre-fetched data, server action handles DB
generateInsights(data: {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  wasteEvents: WasteEvent[]
  monthlyBudget: number | null
  currentMonth: number
}): AIInsight[]

// INSIGHT 1: High-waste menu items
// Find menu items where waste_percentage > average_waste + 2
// For each: generate "waste_reduction" insight with estimated savings
//   estimatedSavings = (wastePercentage - targetWaste) * estimatedMonthlyCost
//   where targetWaste = average_waste
//   where estimatedMonthlyCost = rough estimate based on sales_percentage

// INSIGHT 2: Inventory optimization
// Find items where quantity > reorder_point * 3
// For each: generate "inventory_optimization" insight
//   estimatedSavings = (quantity - optimalQuantity) * price_per_unit * 0.15
//   where optimalQuantity = reorder_point * 2

// INSIGHT 3: Menu performance analysis
// Find menu items where sales_percentage < 5 AND waste_percentage > 3
// These are low performers - generate "menu_optimization" insight
//   Suggest: remove from menu, reduce portion size, or run promotion

// INSIGHT 4: Budget monitoring
// Calculate total inventory spend vs monthly_budget
// If spend > budget * 0.8: generate "cost_optimization" alert
//   title = "Budget alert: {percentage}% of monthly budget used"

// INSIGHT 5: Seasonal bulk ordering
// Find fast-moving items (high turnover) with quantity < reorder_point * 1.5
// If seasonal multiplier for next month > 1.05:
//   Suggest bulk ordering before seasonal demand increase
//   estimatedSavings = bulkDiscount * estimatedOrders (15% savings estimate)

// INSIGHT 6: Waste reduction prediction
// Based on total monthly waste value:
//   If > $100: generate insight with 15% conservative savings estimate
//   potentialSavings = totalMonthlyWaste * 0.15
```

### Confidence Scoring

```typescript
// AI Insight confidence scoring (DIFFERENT from per-item prediction confidence)
// Pure function — accepts counts, not userId
//
// Data quality score (0-1):
//   dataQuality = min(1, (inventoryCount + menuCount) / 20)
//
// Overall AI confidence (0-100):
//   base = dataQuality * 80
//   + 10 if wasteCount > 30
//   + 10 if user has 6+ months of data (i.e., oldest waste event > 180 days ago)
//   Clamped to 0-100
calculateConfidence(counts: {
  inventoryCount: number
  menuCount: number
  wasteEventCount: number
  hasLongHistory: boolean  // true if oldest waste event > 180 days ago
}): number
```

### Save Insights to Database

```typescript
// Save generated insights to ai_insights table
// Set status = 'pending'
saveInsights(userId: string, insights: AIInsight[]): Promise<void>

// Update insight status when user acts on it
updateInsightStatus(
  insightId: string,
  status: 'in_progress' | 'completed' | 'dismissed',
  actualSavings?: number
): Promise<void>

// Save waste analysis snapshot
saveAnalysisSnapshot(userId: string, data: WasteAnalysisSnapshot): Promise<void>
```

---

## Step 5: Waste Management Page

### `app/(dashboard)/waste/page.tsx`

### Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Waste Management                                                    │
│                                                                      │
│  [Overview]  [Log Waste]  [Alerts]  [Benchmarks]                    │
│  ─────────                                                           │
│                                                                      │
│  ── Overview Tab ────────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Monthly   │ │High Risk │ │Potential │ │ Score    │               │
│  │Waste     │ │Items     │ │Savings   │ │          │               │
│  │          │ │          │ │          │ │          │               │
│  │ $847     │ │   5      │ │ $127     │ │ 73/100   │               │
│  │ ↑12% vs  │ │ 🔴 2 crit │ │ /month   │ │ ██████░░ │               │
│  │ last mo  │ │          │ │          │ │ Average  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Waste by Category (horizontal bar chart)                     │  │
│  │                                                               │  │
│  │  Produce  ████████████████  $340 (40%)  🔴                    │  │
│  │  Dairy    ██████████       $210 (25%)  ⚠                     │  │
│  │  Meat     ████████         $170 (20%)                        │  │
│  │  Bakery   ████             $85  (10%)                        │  │
│  │  Other    ██               $42  (5%)                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Top Waste Items                                              │  │
│  │                                                               │  │
│  │  │ Item         │ Waste Rate │ Value │ Risk  │ Trend         │  │
│  │  │──────────────────────────────────────────────────────────  │  │
│  │  │ Lettuce      │ 22.5%  🔴  │ $156  │ Crit  │ ↑ increasing  │  │
│  │  │ Milk         │ 15.3%      │ $92   │ High  │ → stable      │  │
│  │  │ Tomatoes     │ 11.2%      │ $78   │ High  │ ↓ decreasing  │  │
│  │  │ Bread        │ 8.4%       │ $65   │ Med   │ ↑ increasing  │  │
│  │  │ Chicken      │ 6.1%       │ $45   │ Med   │ → stable      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Log Waste Tab Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Overview]  [Log Waste]  [Alerts]  [Benchmarks]                    │
│              ─────────                                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Record Waste Event                                          │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────┐                       │   │
│  │  │ Inventory Item *            ▼    │                       │   │
│  │  └──────────────────────────────────┘                       │   │
│  │                                                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │   │
│  │  │ Quantity *    │ │ Unit         │ │ Est. Value   │        │   │
│  │  │              │ │ (auto-fill)  │ │ (auto-calc)  │        │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────┐                       │   │
│  │  │ Reason *                    ▼    │                       │   │
│  │  │ expired / spoiled / overproduction / prep_waste /        │   │
│  │  │ damaged / customer_return / quality_issue / other        │   │
│  │  └──────────────────────────────────┘                       │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────┐                       │   │
│  │  │ Notes (optional)                 │                       │   │
│  │  │                                  │                       │   │
│  │  └──────────────────────────────────┘                       │   │
│  │                                                              │   │
│  │  [Record Waste]                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── Recent Waste Events ─────────────────────────────────────       │
│                                                                      │
│  │ Date       │ Item     │ Qty    │ Value │ Reason      │           │
│  │────────────────────────────────────────────────────── │           │
│  │ Mar 13     │ Lettuce  │ 3 lbs  │ $6.90 │ Expired     │           │
│  │ Mar 12     │ Milk     │ 2 gal  │ $6.98 │ Spoiled     │           │
│  │ Mar 12     │ Bread    │ 5 pcs  │ $24.95│ Overproduced│           │
│  │ Mar 11     │ Chicken  │ 1.5 kg │ $12.75│ Quality     │           │
└──────────────────────────────────────────────────────────────────────┘
```

### Alerts Tab Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Overview]  [Log Waste]  [Alerts]  [Benchmarks]                    │
│                           ──────                                     │
│                                                                      │
│  🔴 Critical (2)                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 🔴 Mozzarella expires tomorrow!                              │   │
│  │    5 kg ($60.00) at risk                                     │   │
│  │    Suggested: Use in today's specials or freeze              │   │
│  │    [Dismiss]  [Mark Resolved]                                │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ 🔴 Chicken Breast expires today!                             │   │
│  │    2 kg ($17.00) at risk                                     │   │
│  │    Suggested: Prioritize in lunch service                    │   │
│  │    [Dismiss]  [Mark Resolved]                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ⚠ High (3)                                                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ⚠ High waste risk: Lettuce                                   │   │
│  │    Predicted waste: $45 this week (82% confidence)           │   │
│  │    Suggested: Reduce order quantity by 20%                   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ ⚠ Vegetables Mix overstocked by 35%                          │   │
│  │    Current: 16.2 kg, Max: 12 kg                              │   │
│  │    Suggested: Run promotion or adjust menu to use surplus    │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ ⚠ Pastries expire in 3 days                                  │   │
│  │    25 pieces ($87.50) at risk                                │   │
│  │    Suggested: Discount for quick sale                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ℹ Medium (1)                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ℹ Summer dairy spoilage season approaching                    │   │
│  │    Dairy items may spoil 15% faster in June-August           │   │
│  │    Suggested: Reduce dairy order quantities starting May     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Benchmarks Tab Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Overview]  [Log Waste]  [Alerts]  [Benchmarks]                    │
│                                      ──────────                      │
│                                                                      │
│  ── Your Waste Rates vs Industry ────────────────────────────       │
│                                                                      │
│  │ Category │ Your Rate │ Industry Avg │ Best in Class │ Rating     │
│  │───────────────────────────────────────────────────────────────── │
│  │ Produce  │ 8.5%      │ 12.0%        │ 5.0%          │ ✅ Good   │
│  │ Dairy    │ 9.2%      │ 8.0%         │ 3.0%          │ ⚠ Below  │
│  │ Meat     │ 4.1%      │ 6.0%         │ 2.5%          │ ✅ Good   │
│  │ Seafood  │ 7.3%      │ 10.0%        │ 4.0%          │ ✅ Good   │
│  │ Bakery   │ 18.2%     │ 15.0%        │ 7.0%          │ 🔴 Poor  │
│  │ Pantry   │ 1.8%      │ 3.0%         │ 1.0%          │ ✅ Good   │
│                                                                      │
│  ── Improvement Strategies ──────────────────────────────────       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 🔴 Bakery: 18.2% waste (industry avg: 15%)                  │   │
│  │    • Implement day-old bread program (-3% waste)             │   │
│  │    • Reduce batch sizes during slow days (-2% waste)         │   │
│  │    • Partner with food banks for surplus (-5% waste)         │   │
│  │    Potential savings: ~$42/month                              │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ ⚠ Dairy: 9.2% waste (industry avg: 8%)                      │   │
│  │    • First-in-first-out (FIFO) rotation (-2% waste)          │   │
│  │    • Temperature monitoring (-1% waste)                      │   │
│  │    • Smaller, more frequent orders (-1% waste)               │   │
│  │    Potential savings: ~$25/month                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Step 6: AI Insights Page

### `app/(dashboard)/insights/page.tsx`

### Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  AI Insights                                    [🔄 Refresh]        │
│  Smart recommendations to optimize your restaurant                   │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Total    │ │ Potential │ │ Avg      │ │ Completed│               │
│  │ Insights │ │ Savings  │ │ Confid.  │ │          │               │
│  │          │ │          │ │          │ │          │               │
│  │   12     │ │ $495/mo  │ │ 82%      │ │  3/12    │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│  [All] [Pending] [In Progress] [Completed] [Dismissed]              │
│  ───                                                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 🔴 URGENT  │  Waste Reduction                                │   │
│  │                                                              │   │
│  │ Reduce Pizza Waste by 35%                                    │   │
│  │ AI analysis shows your Margherita Pizza has 8.2% waste rate, │   │
│  │ 3.2% above optimal. Implementing portion control could       │   │
│  │ save $180/month.                                             │   │
│  │                                                              │   │
│  │ Confidence: 87.5%  ████████████████████░░                   │   │
│  │ Est. savings: $180/month                                     │   │
│  │ Timeframe: 2-3 weeks                                         │   │
│  │                                                              │   │
│  │ Recommended actions:                                         │   │
│  │  • Implement standardized portion scoops                     │   │
│  │  • Train staff on consistent portioning                      │   │
│  │  • Monitor waste daily for 2 weeks                           │   │
│  │                                                              │   │
│  │ [Start Implementation]  [Dismiss]                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ⚠ HIGH  │  Inventory Optimization                            │   │
│  │                                                              │   │
│  │ Optimize Rice Ordering                                       │   │
│  │ Your jasmine rice inventory turns over 2.3x monthly but      │   │
│  │ you order weekly. Bulk ordering could reduce costs by        │   │
│  │ $95/month.                                                   │   │
│  │                                                              │   │
│  │ Confidence: 78%  ████████████████░░░░░                      │   │
│  │ Est. savings: $95/month                                      │   │
│  │ Timeframe: 1-2 weeks                                         │   │
│  │                                                              │   │
│  │ [Start Implementation]  [Dismiss]                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ... more insight cards ...                                          │
└──────────────────────────────────────────────────────────────────────┘
```

### Insight Card Priority Colors
- URGENT: red left border, red badge
- HIGH: orange left border, orange badge
- MEDIUM: yellow left border, yellow badge
- LOW: gray left border, gray badge

### Mobile: Cards stack full width, confidence bar simplified.

---

## Step 7: Hooks

Create/update `hooks/use-waste-analysis.ts`:

```typescript
export function useWasteAnalysis() {
  // State: patterns, insights, predictions, alerts, loading, error
  // Methods: fetchPatterns, fetchInsights, fetchPredictions, fetchAlerts
  // Computed: totalWasteValue, highRiskItemsCount, criticalAlertsCount, potentialSavings
  // Auto-refresh: optional, every 5 minutes for alerts
  // Full report: combines all data into WasteInsightReport
}
```

Create/update `hooks/use-ai-insights.ts`:

```typescript
export function useAIInsights() {
  // State: insights, loading, error, stats
  // Methods: fetchInsights, refreshInsights, updateStatus, dismissInsight
  // Computed: totalSavings, avgConfidence, pendingCount, completedCount
  // Filtering: by status, by type, by priority
}
```

---

## Step 8: Server Actions

Create `lib/actions/waste.ts`:

```typescript
'use server'

// Server actions are the glue between DB and pure engine functions.
// They: 1) authenticate user, 2) fetch data from Supabase, 3) call engine functions, 4) save results

export async function recordWasteEvent(data: RecordWasteInput): Promise<ActionResult>

// Fetches waste_events + inventory_items, passes to engine functions, saves snapshot
export async function refreshWasteAnalysis(): Promise<ActionResult>

// Fetches all user data, calls generateInsights(), saves to ai_insights table
export async function refreshAIInsights(): Promise<ActionResult>

export async function updateInsightStatus(insightId: string, status: string, savings?: number): Promise<ActionResult>
export async function dismissInsight(insightId: string): Promise<ActionResult>
```

---

## Verification Checklist

1. `npm run build` passes with zero errors
2. `npm run type-check` passes
3. Waste overview page shows KPI cards with correct data
4. Waste by category chart renders
5. Top waste items table shows correct risk levels and trends
6. Log waste form creates waste_events correctly
7. Estimated value auto-calculates (quantity * price_per_unit)
8. Recent waste events list shows correctly
9. Alerts tab groups by severity (critical, high, medium, low)
10. Expiration alerts fire for items within 7 days
11. Overstock alerts fire for items >120% of max_stock_level
12. Benchmarks tab shows comparison against industry averages
13. Rating determination is correct (excellent/good/average/below/poor)
14. AI insights page shows all generated insights
15. Status filter (pending/in_progress/completed/dismissed) works
16. "Start Implementation" updates status to in_progress
17. "Dismiss" updates status to dismissed
18. Refresh button regenerates insights
19. Confidence scoring follows exact formula
20. All formulas match the specifications in this document

## File Summary

```
lib/engines/waste-analysis.ts
lib/engines/waste-predictions.ts
lib/engines/waste-insights.ts
lib/engines/waste-benchmarks.ts
lib/engines/ai-insights.ts
lib/actions/waste.ts
hooks/use-waste-analysis.ts
hooks/use-ai-insights.ts
app/(dashboard)/waste/page.tsx
app/(dashboard)/insights/page.tsx
components/waste/waste-overview.tsx
components/waste/waste-kpi-cards.tsx
components/waste/waste-category-chart.tsx
components/waste/top-waste-table.tsx
components/waste/log-waste-form.tsx
components/waste/waste-events-list.tsx
components/waste/waste-alerts.tsx
components/waste/waste-benchmarks.tsx
components/waste/benchmark-strategies.tsx
components/insights/insight-card.tsx
components/insights/insight-filters.tsx
components/insights/insight-stats.tsx
```
