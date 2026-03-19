# TIER 8: Testing & CI/CD

## Prerequisites
Tiers 1-7 must be complete: Full application functional.

## Overview

**NOTE:** Unit tests for services (Tier 3) and engines (Tier 5) were written inline alongside those tiers. This tier sets up the testing infrastructure, writes E2E tests, configures CI/CD, and fills any remaining test gaps.

1. Vitest configuration and shared test setup
2. Any remaining unit tests not covered in Tiers 3-5
3. Playwright E2E tests for critical user flows
4. GitHub Actions CI/CD pipeline with deployment strategy
5. Coverage targets and bundle size enforcement

---

## Step 1: Vitest Configuration

`vitest.config.ts` should already exist from Tier 1. Ensure it has:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/engines/**', 'lib/services/**', 'lib/utils/**'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import { vi } from 'vitest'

// Mock Supabase client for tests
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  })),
}))
```

---

## Testing Note

Engine functions (`lib/engines/`) are pure functions that accept data and return results — they do **NOT** call Supabase. This means engine tests need NO mocking. Just call the function with test data and assert the output.

Service tests (`lib/services/`) DO interact with Supabase and need the mock from `tests/setup.ts`.

**Important:** The Supabase mock in `tests/setup.ts` is ONLY needed for service tests. Engine tests are pure functions and should NOT import or depend on the mock setup. Keep engine test files completely independent.

---

## Step 2: Unit Tests — Waste Analysis Engine

`tests/unit/engines/waste-analysis.test.ts`:

```typescript
describe('WasteAnalysisEngine', () => {
  describe('waste rate calculation', () => {
    it('calculates waste rate as (wasteQty / inboundQty) * 100')
    it('returns 0 when no inbound quantity')
  })

  describe('risk level determination', () => {
    it('returns critical when wasteRate > 20')
    it('returns critical when wasteValue > 500')
    it('returns high when wasteRate > 10')
    it('returns high when wasteValue > 200')
    it('returns medium when wasteRate > 5')
    it('returns medium when wasteValue > 50')
    it('returns low otherwise')
  })

  describe('seasonal multipliers', () => {
    it('returns correct multiplier for each month (Jan=0.95, Jul=1.15, Dec=1.18)')
    it('applies multiplier to base waste calculation')
  })

  describe('savings calculation', () => {
    it('calculates potentialSavings = currentWaste * (reductionPct / 100)')
    it('calculates payback = implementationCost / (monthlySavings)')
    it('calculates ROI = ((annualSavings - cost) / cost) * 100')
  })

  describe('trend analysis', () => {
    it('returns increasing when current > prev * 1.1')
    it('returns decreasing when current < prev * 0.9')
    it('returns stable otherwise')
  })
})
```

## Step 3: Unit Tests — Waste Predictions

`tests/unit/engines/waste-predictions.test.ts`:

```typescript
describe('WastePredictionEngine', () => {
  describe('prediction factors', () => {
    it('applies seasonal factor from SEASONAL_MULTIPLIERS')
    it('applies stock level factor: 1.3 when >120% max, 1.15 when >100% max')
    it('applies expiration factor: 2.0 when <1 day, 1.5 when <3 days, 1.2 when <7 days')
    it('applies trend factor: 1.2 when increasing, 0.85 when decreasing')
    it('multiplies all factors together for final prediction')
  })

  describe('alert generation', () => {
    it('generates critical alert for items expiring today')
    it('generates critical alert for items expiring tomorrow')
    it('generates high alert for items expiring in 2-3 days')
    it('generates medium alert for items expiring in 3-7 days')
    it('generates high waste risk alert when predicted > $200')
    it('generates medium waste risk alert when predicted > $50')
    it('generates overstock alert when quantity > max_stock * 1.2')
  })

  describe('per-item prediction confidence', () => {
    it('calculates data quality = min(1, itemWasteEventsCount / 10)')
    it('confidence = min(95, dataQuality * 100)')
    it('caps at 95 (not 100 — predictions are never 100% confident)')
  })

  describe('prevention ROI', () => {
    it('monthlySavings = currentWaste * (expectedReduction / 100)')
    it('annualSavings = monthlySavings * 12')
    it('roi = ((annualSavings - cost) / cost) * 100')
    it('paybackMonths = cost / monthlySavings')
  })
})
```

## Step 4: Unit Tests — AI Insights

`tests/unit/engines/ai-insights.test.ts`:

```typescript
describe('AIInsightEngine', () => {
  describe('high-waste menu items', () => {
    it('detects items with waste > average + 2%')
    it('generates waste_reduction insight type')
  })

  describe('inventory optimization', () => {
    it('detects items with quantity > reorder_point * 3')
    it('estimates savings at 15% of excess value')
  })

  describe('menu performance', () => {
    it('identifies low performers: sales < 5% AND waste > 3%')
    it('generates menu_optimization insight')
  })

  describe('budget monitoring', () => {
    it('alerts when spend > budget * 0.8')
    it('generates cost_optimization insight')
  })

  describe('seasonal ordering', () => {
    it('suggests bulk ordering when seasonal multiplier > 1.05')
    it('targets fast-moving items below 1.5x reorder point')
    it('estimates 15% savings on bulk orders')
  })

  describe('AI insight confidence scoring', () => {
    it('calculates data quality = min(1, (inventoryCount + menuCount) / 20)')
    it('base confidence = dataQuality * 80')
    it('adds 10 for >30 waste events')
    it('adds 10 for 6+ months of waste history')
    it('caps at 100')
  })
})
```

## Step 5: Unit Tests — Inventory & Recipe Services

`tests/unit/services/inventory.test.ts`:

```typescript
describe('InventoryService', () => {
  it('getLowStockItems returns items where quantity < reorder_point')
  it('getExpiringItems returns items expiring within N days')
  it('getTotalInventoryValue sums quantity * price_per_unit')
  it('calculateEstimatedSavings applies 15% for low stock, 20% for expiry')
  it('validates name length 1-200 chars')
  it('validates quantity >= 0')
  it('validates price_per_unit >= 0')

  // adjustQuantity — race-safe relative updates
  it('adjustQuantity applies positive delta to current quantity')
  it('adjustQuantity applies negative delta to current quantity')
  it('adjustQuantity floors at 0 via GREATEST(0, quantity + delta) — never negative')
  it('adjustQuantity returns null when item is soft-deleted (0 rows affected)')
  it('adjustQuantity only affects items WHERE deleted_at IS NULL')

  // Soft-delete filtering
  it('getInventoryItems excludes soft-deleted items (deleted_at IS NOT NULL)')
  it('getLowStockItems excludes soft-deleted items')
  it('getExpiringItems excludes soft-deleted items')
  it('getCount excludes soft-deleted items')
})
```

`tests/unit/services/recipes.test.ts`:

```typescript
describe('RecipeService', () => {
  it('calculateRecipeCost sums (quantity_needed * cost_per_unit)')
  it('calculateProfitMargin = ((price - cost) / price) * 100')
  it('returns 0 margin when price is 0')
  it('checkIngredientAvailability identifies shortfalls')
})
```

## Step 6: Unit Tests — CSV Utility

`tests/unit/utils/csv.test.ts`:

```typescript
describe('CSV Utils', () => {
  it('exports inventory items to valid CSV string')
  it('includes headers: Name, Category, Quantity, Unit, Expiry Date, Reorder Point, Price Per Unit')
  it('handles commas in item names by quoting')
  it('parses valid CSV into inventory items')
  it('reports errors for invalid rows')
  it('validates parsed data against schema')
})
```

## Step 7: Unit Tests — Waste Benchmarks

`tests/unit/engines/waste-benchmarks.test.ts`:

```typescript
describe('WasteBenchmarks', () => {
  it('rates excellent when userRate <= bestInClass')
  it('rates good when userRate <= midpoint(bestInClass, average)')
  it('rates average when userRate <= industryAverage')
  it('rates below_average when userRate <= average * 1.5')
  it('rates poor when userRate > average * 1.5')
  it('has benchmarks for Produce, Dairy, Meat, Seafood, Bakery, Pantry, Beverages, Frozen')
})
```

---

## Step 8: Playwright E2E Tests

`playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Files

`tests/e2e/auth.spec.ts`:
```typescript
test('redirects unauthenticated user to login')
test('shows login form with email and password fields')
test('shows signup form with restaurant name field')
test('displays validation errors for invalid input')
```

`tests/e2e/dashboard.spec.ts`:
```typescript
test('shows KPI cards on dashboard')
test('navigation links work')
test('sidebar highlights active route')
test('mobile menu opens and closes')
```

`tests/e2e/inventory.spec.ts`:
```typescript
test('displays inventory table')
test('search filters items by name')
test('add item dialog opens and validates')
test('mobile stepper adjusts quantity and shows server-confirmed value')
test('waste event atomically decrements inventory quantity')
test('soft-deleted items do not appear in inventory list')
```

---

## Step 9: GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, unit-tests]
    env:
      NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
      SUPABASE_SERVICE_ROLE_KEY: placeholder
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: placeholder
      STRIPE_SECRET_KEY: placeholder
      STRIPE_WEBHOOK_SECRET: placeholder
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci

      # Enforce: no build bypasses allowed
      - name: Enforce strict builds
        run: |
          if grep -q 'ignoreDuringBuilds.*true' next.config.ts 2>/dev/null || grep -q 'ignoreDuringBuilds.*true' next.config.js 2>/dev/null; then
            echo "::error::ignoreDuringBuilds must not be true. Fix TypeScript/ESLint errors instead of suppressing them."
            exit 1
          fi

      - run: npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        if: env.SUPABASE_E2E_URL != ''
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_E2E_URL || 'https://placeholder.supabase.co' }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_E2E_ANON_KEY || 'placeholder' }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Step 9b: Deployment Strategy

### Vercel Environment Configuration

Three environments, each with its own Supabase project:

| Environment | Trigger | Supabase | Stripe Keys | Purpose |
|-------------|---------|----------|-------------|---------|
| **Preview** | Every PR | Preview project | Test keys | PR review, QA |
| **Staging** | Push to `main` | Staging project | Test keys | Pre-production validation |
| **Production** | Manual promote from staging | Production project | Live keys | User-facing |

### Vercel Setup

1. Connect repo to Vercel
2. Set environment variables per environment (Settings → Environment Variables)
3. Enable "Preview Deployments" for all branches
4. Set Production branch to `main` (auto-deploys to staging; manual promote to production)

### Rollback Plan

Vercel keeps every deployment immutable. To rollback:
1. Go to Vercel Dashboard → Deployments
2. Find last known-good deployment
3. Click "Promote to Production"

No code changes needed. Instant rollback. Zero downtime.

### Environment Variable Checklist

Each environment needs:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
NEXT_PUBLIC_APP_URL
```

---

## Step 10: Package.json Scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Verification Checklist

1. `npm run test` — all unit tests pass
2. `npm run test:coverage` — coverage meets 70% threshold for engines/services/utils
3. `npm run lint` — no warnings
4. `npm run type-check` — no errors
5. `npm run build` — builds successfully
6. `npm run test:e2e` — E2E tests pass (at least auth and navigation tests)
7. `.github/workflows/ci.yml` exists and is valid YAML

## File Summary

```
tests/setup.ts
tests/unit/engines/waste-analysis.test.ts
tests/unit/engines/waste-predictions.test.ts
tests/unit/engines/waste-benchmarks.test.ts
tests/unit/engines/ai-insights.test.ts
tests/unit/services/inventory.test.ts
tests/unit/services/recipes.test.ts
tests/unit/utils/csv.test.ts
tests/e2e/auth.spec.ts
tests/e2e/dashboard.spec.ts
tests/e2e/inventory.spec.ts
playwright.config.ts (update if needed)
vitest.config.ts (update with coverage)
.github/workflows/ci.yml
package.json (update scripts)
```
