# TIER 6: Dashboard KPIs, Analytics & Charts

## Prerequisites
Tier 5 must be complete: Waste analysis, predictions, AI insights all functional.

## Overview
This tier builds:
1. Enhanced dashboard home page with real KPI data
2. Analytics page with charts (Recharts)
3. Waste trend charts over time
4. Inventory value charts
5. Cost analysis visualizations

---

## Step 1: Update Dashboard Home Page

Replace the placeholder `app/(dashboard)/page.tsx` with real data fetching.

### KPI Cards — fetch from database

```typescript
// Server component — fetch ALL dashboard data in PARALLEL for performance.
// Sequential awaits would cause 7+ round trips; Promise.all reduces to ~1 round trip.
const [
  totalItems,
  lowStockItems,
  expiringItems,
  totalValue,
  savings,
  snapshotResult,
  insightsResult,
] = await Promise.all([
  inventoryService.getCount(userId),
  inventoryService.getLowStockItems(userId),
  inventoryService.getExpiringItems(userId),
  inventoryService.getTotalInventoryValue(userId),
  inventoryService.calculateEstimatedSavings(userId),
  supabase.from('waste_analysis_snapshots').select('*').eq('user_id', userId)
    .order('analysis_date', { ascending: false }).limit(1),
  supabase.from('ai_insights').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('status', 'pending'),
])

const latestSnapshot = snapshotResult.data?.[0] ?? null
const monthlySpend = latestSnapshot?.monthly_spend ?? 0

const stats = {
  totalItems,
  lowStockCount: lowStockItems.length,
  expiringCount: expiringItems.length,
  totalValue,
  monthlySpend,
  budgetUsed: user.monthly_budget ? (monthlySpend / user.monthly_budget) * 100 : 0,
  wasteRate: latestSnapshot?.average_waste_percentage ?? 0,
  potentialSavings: savings,
  activeInsights: insightsResult.count ?? 0,
}
```

### Full Dashboard Wireframe (Desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dashboard                                     Good morning, Mario   │
│  Mario's Italian Kitchen                                             │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │📦 Items  │ │⚠ Low     │ │🔴 Expiring│ │💰 Value  │               │
│  │          │ │  Stock   │ │  Soon    │ │          │               │
│  │   47     │ │    5     │ │    3     │ │ $8,420   │               │
│  │ items    │ │ items    │ │ items    │ │ total    │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │📊 Budget │ │📉 Waste  │ │💡 Savings│ │🧠 Insights│               │
│  │          │ │  Rate    │ │          │ │          │               │
│  │  68%     │ │  6.8%    │ │ $127/mo  │ │  4 new   │               │
│  │ of $5k   │ │ ↓ 0.5%   │ │ potential│ │ pending  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│  ┌─────────────────────────────────────┐ ┌────────────────────────┐ │
│  │  Inventory by Category (Pie Chart)  │ │  Waste Trend (Line)    │ │
│  │                                     │ │                        │ │
│  │         ┌───┐                       │ │  $                     │ │
│  │        /     \                      │ │  │    /\               │ │
│  │       │ PIE   │                     │ │  │   /  \    /\       │ │
│  │        \     /                      │ │  │  /    \  /  \      │ │
│  │         └───┘                       │ │  │ /      \/    \     │ │
│  │                                     │ │  └──────────────────  │ │
│  │  ● Produce 35%  ● Dairy 20%       │ │   Jan Feb Mar Apr May  │ │
│  │  ● Meat 18%     ● Pantry 15%      │ │                        │ │
│  │  ● Other 12%                       │ │                        │ │
│  └─────────────────────────────────────┘ └────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────┐ ┌────────────────────────┐ │
│  │  Quick Actions                      │ │  Recent Alerts         │ │
│  │                                     │ │                        │ │
│  │  [+ Add Inventory Item]             │ │  🔴 Chicken expires    │ │
│  │  [📝 Log Waste]                     │ │     today              │ │
│  │  [📊 View Analytics]               │ │  ⚠ Lettuce high waste │ │
│  │  [💡 View Insights]                │ │  ⚠ Milk overstocked   │ │
│  │  [📥 Import CSV]                   │ │                        │ │
│  │  [📤 Export Report]                │ │  [View All Alerts →]   │ │
│  └─────────────────────────────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile: 2-column grid for KPI cards (scrollable), charts stack vertically, full width.

### Empty State (Zero Inventory Items)

When `totalItems === 0`, replace the charts and KPI section with:
```
┌────────────────────────────────────────────────────────┐
│  📦 Welcome to OnPar!                                  │
│                                                        │
│  Add your first inventory items to see your dashboard  │
│  come alive with real-time KPIs, charts, and AI        │
│  insights.                                             │
│                                                        │
│  [+ Add Your First Item]    [📥 Import CSV]            │
└────────────────────────────────────────────────────────┘
```
Quick Actions panel still renders (it's useful even with zero data). KPI cards show zeroes (not blank).

---

## Step 2: Analytics Page

### `app/(dashboard)/analytics/page.tsx`

### Empty State (Insufficient Data)

When the selected date range has fewer than 3 data points for any chart, show inline in that chart's container:
```
"Not enough data for this time range. Try selecting a longer period or check back after a few more days of usage."
```
Charts with zero data points show empty axes with a centered message (not a blank white box).

### Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Analytics                              Date Range: [Last 30 days ▼]│
│                                                                      │
│  [Inventory]  [Waste]  [Cost]  [Performance]                        │
│  ─────────                                                           │
│                                                                      │
│  ── Inventory Tab ───────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Inventory Value Over Time (Area Chart)                      │   │
│  │                                                              │   │
│  │  $10k │                          ╱──                         │   │
│  │       │                    ╱────╱                             │   │
│  │  $8k  │              ╱────╱                                   │   │
│  │       │         ╱───╱                                         │   │
│  │  $6k  │    ╱───╱                                              │   │
│  │       │───╱                                                    │   │
│  │  $4k  │                                                        │   │
│  │       └────────────────────────────────────                   │   │
│  │        Week 1  Week 2  Week 3  Week 4                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────┐ ┌────────────────────────────────┐   │
│  │  Stock Levels by Category │ │  Items Needing Attention       │   │
│  │  (Stacked Bar Chart)      │ │                                │   │
│  │                           │ │  ┌────────────────────────┐   │   │
│  │  Produce ████████████     │ │  │ Low Stock (5)          │   │   │
│  │  Dairy   ██████████       │ │  │ • Mozzarella           │   │   │
│  │  Meat    ████████         │ │  │ • Chicken Breast       │   │   │
│  │  Pantry  ████████████████ │ │  │ • ...                  │   │   │
│  │  Seafood ██████           │ │  ├────────────────────────┤   │   │
│  │                           │ │  │ Expiring Soon (3)      │   │   │
│  │  ▓ In Stock  ░ Below ROP  │ │  │ • Milk (2 days)        │   │   │
│  │                           │ │  │ • Pastries (1 day)     │   │   │
│  └───────────────────────────┘ └────────────────────────────────┘   │
│                                                                      │
│  ── Waste Tab ───────────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Monthly Waste Value (Bar Chart)                             │   │
│  │                                                              │   │
│  │  $1.2k│                                                       │   │
│  │       │  ██                                          ██       │   │
│  │  $800 │  ██  ██                              ██      ██       │   │
│  │       │  ██  ██  ██                    ██    ██      ██       │   │
│  │  $400 │  ██  ██  ██  ██          ██    ██    ██      ██       │   │
│  │       │  ██  ██  ██  ██    ██    ██    ██    ██      ██       │   │
│  │       └──────────────────────────────────────────────────    │   │
│  │        Oct  Nov  Dec  Jan  Feb  Mar  Apr  May  ...           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────┐ ┌────────────────────────────────┐   │
│  │  Waste by Reason          │ │  Waste Rate Trend              │   │
│  │  (Donut Chart)            │ │  (Line Chart)                  │   │
│  │                           │ │                                │   │
│  │    ┌─────┐               │ │  %                             │   │
│  │   / DONUT \              │ │  │  ─── Your rate              │   │
│  │   \      /               │ │  │  - - Industry avg            │   │
│  │    └─────┘               │ │  │                              │   │
│  │                           │ │  8│    /\                       │   │
│  │  ● Expired 35%            │ │  6│___/  \___/\____            │   │
│  │  ● Spoiled 25%            │ │  4│--- --- --- ---             │   │
│  │  ● Overproduced 20%       │ │   └────────────────           │   │
│  │  ● Prep waste 12%         │ │    Oct Nov Dec Jan Feb         │   │
│  │  ● Other 8%               │ │                                │   │
│  └───────────────────────────┘ └────────────────────────────────┘   │
│                                                                      │
│  ── Cost Tab ────────────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Monthly Spend vs Budget (Combo Chart)                       │   │
│  │                                                              │   │
│  │  $6k │  ─── Budget line ($5,000)                             │   │
│  │      │  ═══════════════════════════                          │   │
│  │  $4k │  ██  ██  ██  ██  ██  ██                               │   │
│  │      │  ██  ██  ██  ██  ██  ██                               │   │
│  │  $2k │  ██  ██  ██  ██  ██  ██                               │   │
│  │      │  ██  ██  ██  ██  ██  ██                               │   │
│  │      └──────────────────────────                             │   │
│  │       Oct  Nov  Dec  Jan  Feb  Mar                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────┐ ┌────────────────────────────────┐   │
│  │  Top Cost Categories      │ │  Recipe Profitability          │   │
│  │  (Bar Chart, horizontal)  │ │  (Scatter Plot)                │   │
│  │                           │ │                                │   │
│  │  Meat     ████████ $2.1k  │ │  Margin%                       │   │
│  │  Seafood  ██████   $1.6k  │ │  80│  ●    ●                   │   │
│  │  Dairy    █████    $1.2k  │ │  60│    ●     ●                │   │
│  │  Produce  ████     $980   │ │  40│      ●                    │   │
│  │  Pantry   ███      $720   │ │  20│                           │   │
│  │                           │ │    └────────────────           │   │
│  │                           │ │     $2  $4  $6  $8  Cost      │   │
│  └───────────────────────────┘ └────────────────────────────────┘   │
│                                                                      │
│  ── Performance Tab ─────────────────────────────────────────────    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Overall Performance Score                                   │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────┐     │   │
│  │  │         73 / 100  — Average                        │     │   │
│  │  │  ████████████████████████████████████░░░░░░░░░░░  │     │   │
│  │  │  0                    50                       100 │     │   │
│  │  └────────────────────────────────────────────────────┘     │   │
│  │                                                              │   │
│  │  Breakdown:                                                  │   │
│  │  • Waste management:   68/100  ████████████████████░░░░     │   │
│  │  • Inventory turnover: 75/100  ████████████████████████░    │   │
│  │  • Cost efficiency:    78/100  █████████████████████████░   │   │
│  │  • Budget adherence:   72/100  ████████████████████████░░   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Key Metrics Summary                                         │   │
│  │                                                              │   │
│  │  │ Metric              │ Current │ Prev Month │ Change │     │   │
│  │  │──────────────────────────────────────────────────────│     │   │
│  │  │ Inventory Turnover  │ 1.46x   │ 1.38x      │ ↑ 5.8%│     │   │
│  │  │ Waste Rate          │ 6.8%    │ 7.3%       │ ↓ 0.5%│     │   │
│  │  │ Cost Efficiency     │ 73.2%   │ 70.1%      │ ↑ 3.1%│     │   │
│  │  │ Budget Usage        │ 68%     │ 72%        │ ↓ 4%  │     │   │
│  │  │ Monthly Waste       │ $847    │ $923       │ ↓ 8.2%│     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Performance Score Formulas

These formulas are used by the Performance tab in the analytics page:

```typescript
// Overall score = average of 4 component scores (0-100)

// Waste management score:
//   base = 100 - (avgWastePercentage * 10)
//   clamped 0-100

// Inventory turnover score:
//   turnover = monthlySpend / totalInventoryValue
//   score = min(100, turnover * 50)  // 2.0x turnover = 100

// Cost efficiency score:
//   score = 100 - (wasteValue / totalInventoryValue * 100)
//   clamped 0-100

// Budget adherence score:
//   if no budget set: 75 (neutral)
//   else: 100 - max(0, (budgetUsed - 100))  // 100% = perfect, over = penalized
//   clamped 0-100
```

---

## Step 3: Chart Components

Use **Recharts** for all charts. Create reusable chart components:

`components/charts/area-chart.tsx` — For inventory value over time
`components/charts/bar-chart.tsx` — For monthly waste, category costs
`components/charts/line-chart.tsx` — For waste rate trends
`components/charts/pie-chart.tsx` — For category distribution
`components/charts/donut-chart.tsx` — For waste by reason
`components/charts/combo-chart.tsx` — For spend vs budget

### Chart Design Guidelines
- Use brand color palette: brand-500, brand-600 as primary
- Secondary colors: blue-500, amber-500, rose-500, violet-500
- Responsive: charts resize with container
- Tooltips on hover showing exact values
- Legend positioned below chart on mobile, to the right on desktop
- Animate on initial render (300ms)
- Grid lines: subtle, light gray

### Chart Wrapper Component

```typescript
// Wrapper that handles responsive sizing and loading state
components/charts/chart-wrapper.tsx

interface ChartWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  isLoading?: boolean
  height?: number  // default 300
}
```

---

## Step 4: Date Range Selector

```
┌────────────────────────────────────┐
│  Date Range:                       │
│  [Last 7 days  ▼]                 │
│                                    │
│  Options:                          │
│  • Last 7 days                     │
│  • Last 30 days                    │
│  • Last 90 days                    │
│  • Last 6 months                   │
│  • Last 12 months                  │
│  • Custom range...                 │
└────────────────────────────────────┘
```

---

## Step 5: Export Report Button

On the analytics page, add an "Export Report" button that generates a summary PDF or CSV of all key metrics for the selected time period.

For now, implement CSV export with key metrics table.

---

## Verification Checklist

1. `npm run build` passes
2. Dashboard home shows real KPI data from database
3. Pie chart renders for inventory by category
4. Waste trend line chart renders with historical data
5. Analytics page has 4 tabs (Inventory, Waste, Cost, Performance)
6. All charts render correctly with real data
7. Charts are responsive (resize on window change)
8. Tooltips work on chart hover
9. Date range selector filters chart data
10. Performance score calculates correctly
11. Key metrics summary shows current vs previous month
12. Mobile layout stacks charts vertically
13. Loading states show while data fetches

## File Summary

```
app/(dashboard)/page.tsx (rewrite with real data)
app/(dashboard)/analytics/page.tsx (rewrite)
components/dashboard/kpi-cards.tsx
components/dashboard/quick-actions.tsx
components/dashboard/recent-alerts.tsx
components/charts/chart-wrapper.tsx
components/charts/area-chart.tsx
components/charts/bar-chart.tsx
components/charts/line-chart.tsx
components/charts/pie-chart.tsx
components/charts/donut-chart.tsx
components/charts/combo-chart.tsx
components/analytics/inventory-analytics.tsx
components/analytics/waste-analytics.tsx
components/analytics/cost-analytics.tsx
components/analytics/performance-analytics.tsx
components/analytics/date-range-selector.tsx
components/analytics/metrics-summary-table.tsx
```
