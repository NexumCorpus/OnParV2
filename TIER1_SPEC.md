# TIER 1: Project Scaffolding & Database Schema

## Overview
You are rebuilding a restaurant inventory management SaaS app called **OnPar** from the ground up. This is Tier 1 of 9 — setting up the project foundation and database schema.

## Step 1: Clean the Repository

Remove ALL existing files in `/home/user/OnParV2/` EXCEPT:
- `.git/` directory (preserve git history)
- Do NOT delete `.git`

Remove everything else: `app/`, `components/`, `lib/`, `hooks/`, `types/`, `supabase/`, `docs/`, `scripts/`, `src/`, `.bolt/`, `.kiro/`, all `*.md` files, all config files (`next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `package.json`, `middleware.ts`, `vercel.json`, `postcss.config.js`, `components.json`, `.eslintrc.json`, `.nvmrc`, `.env.example`, `package-lock.json`).

## Step 2: Initialize Next.js 16 Project

In `/home/user/OnParV2/`, scaffold a new Next.js project:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=false --turbopack --import-alias "@/*"
```

After scaffolding, ensure:
- Next.js 16 (latest)
- React 19
- TypeScript 5.x
- Tailwind CSS 4.x
- App Router (not Pages Router)

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js recharts react-hook-form @hookform/resolvers zod date-fns lucide-react sonner next-themes class-variance-authority clsx tailwind-merge
```

```bash
npm install -D @types/node vitest @vitejs/plugin-react @vitest/coverage-v8 jsdom playwright @playwright/test
```

## Step 4: Configure TypeScript (STRICT)

`tsconfig.json` — TypeScript must be strict. No error suppression anywhere.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 5: Configure Next.js 16 (STRICT — no error suppression)

`next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // DO NOT set ignoreDuringBuilds for eslint or typescript
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
}

export default nextConfig
```

## Step 6: Configure Tailwind CSS 4

Tailwind 4 uses CSS-first configuration. Create `app/globals.css`:

```css
@import "tailwindcss";

/* Design tokens */
@theme {
  --color-brand-50: #f0fdf4;
  --color-brand-100: #dcfce7;
  --color-brand-200: #bbf7d0;
  --color-brand-300: #86efac;
  --color-brand-400: #4ade80;
  --color-brand-500: #22c55e;
  --color-brand-600: #16a34a;
  --color-brand-700: #15803d;
  --color-brand-800: #166534;
  --color-brand-900: #14532d;
  --color-brand-950: #052e16;

  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --radius-lg: 0.75rem;
  --radius-md: 0.5rem;
  --radius-sm: 0.25rem;
}

/* Light mode variables */
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --border: #e4e4e7;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
}

/* Dark mode — class-based for next-themes compatibility */
.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #0a0a0a;
  --card-foreground: #fafafa;
  --border: #27272a;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

## Step 7: Create Utility File

`lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Step 7b: Create Formatting Utility

`lib/utils/formatting.ts`:

```typescript
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
```

## Step 7c: Create Base Config File

`lib/config.ts`:

```typescript
// App-wide constants — pricing plans added in Tier 7
export const APP_NAME = 'OnPar'
export const APP_DESCRIPTION = 'Smart Restaurant Inventory Management'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
```

## Step 8: Set Up Supabase Client Files

`lib/supabase/client.ts` — Browser client:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts` — Server client:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```

`lib/supabase/admin.ts` — Service role client (bypasses RLS, for webhooks and server-only operations):

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

`lib/supabase/middleware.ts` — Auth middleware helper:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
```

`middleware.ts` (root):

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Step 9: Environment Variables Template

`.env.example`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

`.env.local` (create with placeholder values so the app can build):

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=placeholder
STRIPE_SECRET_KEY=placeholder
STRIPE_WEBHOOK_SECRET=placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 10: Database Schema Migration

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- OnPar Database Schema v2 (Clean Redesign)
-- Single migration file replacing 20+ fragmented migrations

------------------------------------------------------------
-- UTILITY FUNCTIONS
------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- USERS
------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  restaurant_name text,
  monthly_budget numeric(10,2),
  avatar_url text,
  settings jsonb NOT NULL DEFAULT '{
    "reorder_multiplier": 2.0,
    "low_stock_threshold": 0.8,
    "expiry_warning_days": 7,
    "budget_warning_threshold": 0.9,
    "email_notifications": true,
    "onboarding_completed": false
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

------------------------------------------------------------
-- SUPPLIERS
------------------------------------------------------------

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_own" ON suppliers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "suppliers_insert_own" ON suppliers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "suppliers_update_own" ON suppliers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "suppliers_delete_own" ON suppliers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- INVENTORY ITEMS
------------------------------------------------------------

CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Uncategorized',
  quantity numeric(12,3) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pieces',
  expiry_date date,
  reorder_point numeric(12,3) NOT NULL DEFAULT 0,
  max_stock_level numeric(12,3),
  price_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  deleted_at timestamptz, -- soft delete: set to NOW() instead of hard deleting. All queries MUST filter WHERE deleted_at IS NULL.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_own" ON inventory_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_insert_own" ON inventory_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inventory_update_own" ON inventory_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "inventory_delete_own" ON inventory_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_supplier ON inventory_items(supplier_id);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- MENU ITEMS
------------------------------------------------------------

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Main Course',
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  sales_percentage numeric(5,2) NOT NULL DEFAULT 0,
  waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_select_own" ON menu_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "menu_insert_own" ON menu_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "menu_update_own" ON menu_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "menu_delete_own" ON menu_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_menu_user_id ON menu_items(user_id);

CREATE TRIGGER trg_menu_updated_at
  BEFORE UPDATE ON menu_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- RECIPES
------------------------------------------------------------

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Main Course',
  serving_size integer NOT NULL DEFAULT 1,
  prep_time_minutes integer,
  cook_time_minutes integer,
  difficulty_level text NOT NULL DEFAULT 'medium'
    CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  instructions text,
  cost_per_serving numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  profit_margin numeric(5,2) NOT NULL DEFAULT 0,
  popularity_score numeric(5,2) NOT NULL DEFAULT 0, -- manually entered or derived from POS integration (future)
  waste_percentage numeric(5,2) NOT NULL DEFAULT 0, -- manually entered estimate of food waste for this recipe
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_own" ON recipes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "recipes_insert_own" ON recipes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update_own" ON recipes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete_own" ON recipes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- RECIPE INGREDIENTS
------------------------------------------------------------

CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_needed numeric(10,3) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ingredients_select" ON recipe_ingredients
  FOR SELECT TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_insert" ON recipe_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_update" ON recipe_ingredients
  FOR UPDATE TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_delete" ON recipe_ingredients
  FOR DELETE TO authenticated
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item ON recipe_ingredients(inventory_item_id);

------------------------------------------------------------
-- WASTE EVENTS
------------------------------------------------------------

CREATE TABLE waste_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  quantity numeric(12,3) NOT NULL,
  unit text NOT NULL,
  estimated_value numeric(10,2) NOT NULL DEFAULT 0,
  reason text NOT NULL CHECK (reason IN (
    'expired', 'spoiled', 'overproduction', 'prep_waste',
    'damaged', 'customer_return', 'quality_issue', 'other'
  )),
  notes text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE waste_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waste_events_select_own" ON waste_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "waste_events_insert_own" ON waste_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "waste_events_update_own" ON waste_events
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "waste_events_delete_own" ON waste_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_waste_events_user_id ON waste_events(user_id);
CREATE INDEX idx_waste_events_item ON waste_events(inventory_item_id);
CREATE INDEX idx_waste_events_recorded ON waste_events(recorded_at);
CREATE INDEX idx_waste_events_reason ON waste_events(reason);

------------------------------------------------------------
-- PRODUCTS (shared barcode lookup table)
------------------------------------------------------------

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  category text,
  unit text NOT NULL DEFAULT 'pieces',
  average_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_all" ON products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_service_manage" ON products
  FOR ALL TO service_role USING (true);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- AI INSIGHTS
------------------------------------------------------------

CREATE TABLE ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'waste_reduction', 'cost_optimization',
    'inventory_optimization', 'menu_optimization'
  )),
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  estimated_savings numeric(10,2) NOT NULL DEFAULT 0,
  confidence numeric(5,2) NOT NULL DEFAULT 0
    CHECK (confidence >= 0 AND confidence <= 100),
  data_points jsonb NOT NULL DEFAULT '[]',
  recommended_actions jsonb NOT NULL DEFAULT '[]',
  related_items jsonb NOT NULL DEFAULT '[]',
  timeframe text NOT NULL DEFAULT 'Unknown',
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  implementation_date timestamptz,
  completion_date timestamptz,
  actual_savings numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_select_own" ON ai_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights_insert_own" ON ai_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_update_own" ON ai_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights_delete_own" ON ai_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_insights_type ON ai_insights(type);
CREATE INDEX idx_insights_status ON ai_insights(status);
CREATE INDEX idx_insights_priority ON ai_insights(priority);

CREATE TRIGGER trg_insights_updated_at
  BEFORE UPDATE ON ai_insights FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- WASTE ANALYSIS SNAPSHOTS
------------------------------------------------------------

CREATE TABLE waste_analysis_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_date date NOT NULL DEFAULT CURRENT_DATE,
  total_inventory_value numeric(12,2) NOT NULL DEFAULT 0,
  monthly_spend numeric(12,2) NOT NULL DEFAULT 0,
  average_waste_percentage numeric(5,2) NOT NULL DEFAULT 0,
  inventory_turnover numeric(8,4) NOT NULL DEFAULT 0,
  cost_efficiency_score numeric(5,2) NOT NULL DEFAULT 0,
  seasonal_factor numeric(5,4) NOT NULL DEFAULT 1.0,
  data_quality_score numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, analysis_date)
);

ALTER TABLE waste_analysis_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_select_own" ON waste_analysis_snapshots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshots_insert_own" ON waste_analysis_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "snapshots_update_own" ON waste_analysis_snapshots
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshots_delete_own" ON waste_analysis_snapshots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_snapshots_user_id ON waste_analysis_snapshots(user_id);
CREATE INDEX idx_snapshots_date ON waste_analysis_snapshots(analysis_date);

------------------------------------------------------------
-- FEEDBACK
------------------------------------------------------------

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'general')),
  message text NOT NULL,
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_any" ON feedback
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "feedback_select_own" ON feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "feedback_service_read" ON feedback
  FOR SELECT TO service_role USING (true);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);

------------------------------------------------------------
-- STRIPE CUSTOMERS
------------------------------------------------------------

CREATE TABLE stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_customers_select_own" ON stripe_customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- STRIPE SUBSCRIPTIONS
------------------------------------------------------------

CREATE TYPE subscription_status AS ENUM (
  'not_started', 'incomplete', 'incomplete_expired',
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'
);

CREATE TABLE stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text NOT NULL UNIQUE,
  subscription_id text,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status subscription_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stripe_subs_select_own" ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()
  ));

CREATE TRIGGER trg_stripe_subs_updated_at
  BEFORE UPDATE ON stripe_subscriptions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 11: Seed Data

Create `supabase/seed.sql`:

```sql
-- Sample products for barcode lookup
INSERT INTO products (barcode, name, brand, category, unit, average_price) VALUES
  ('123456789012', 'Organic Tomatoes', 'Fresh Valley', 'Produce', 'lbs', 3.99),
  ('987654321098', 'Fresh Mozzarella', 'Bella Vista', 'Dairy', 'lbs', 8.99),
  ('456789123456', 'Extra Virgin Olive Oil', 'Mediterranean Gold', 'Pantry', 'bottles', 12.99),
  ('789123456789', 'Whole Wheat Pasta', 'Artisan Mills', 'Pantry', 'boxes', 2.49),
  ('321654987321', 'Sea Salt', 'Ocean Harvest', 'Seasonings', 'containers', 4.99),
  ('654987321654', 'Black Pepper', 'Spice Masters', 'Seasonings', 'containers', 6.99),
  ('147258369147', 'Chicken Breast', 'Farm Fresh', 'Meat', 'lbs', 7.99),
  ('258369147258', 'Ground Beef', 'Premium Cuts', 'Meat', 'lbs', 9.99),
  ('369147258369', 'Salmon Fillet', 'Ocean Select', 'Seafood', 'lbs', 16.99),
  ('741852963741', 'Romaine Lettuce', 'Green Fields', 'Produce', 'heads', 2.99),
  ('852963741852', 'Yellow Onions', 'Farm Direct', 'Produce', 'lbs', 1.99),
  ('963741852963', 'Garlic Cloves', 'Aromatic Farms', 'Produce', 'lbs', 4.99),
  ('159753486159', 'Cheddar Cheese', 'Dairy Best', 'Dairy', 'lbs', 6.99),
  ('357159486357', 'Whole Milk', 'Fresh Dairy', 'Dairy', 'gallons', 3.49),
  ('486159357486', 'Sourdough Bread', 'Artisan Bakery', 'Bakery', 'loaves', 4.99),
  ('159486357159', 'Canola Oil', 'Pure Gold', 'Pantry', 'bottles', 8.99),
  ('486357159486', 'All-Purpose Flour', 'Baker''s Choice', 'Pantry', 'lbs', 3.99),
  ('357486159357', 'White Sugar', 'Sweet Valley', 'Pantry', 'lbs', 2.99),
  ('486159486159', 'Kosher Salt', 'Crystal Pure', 'Seasonings', 'containers', 3.99),
  ('159357159357', 'Vanilla Extract', 'Pure Essence', 'Baking', 'bottles', 9.99)
ON CONFLICT (barcode) DO NOTHING;
```

## Step 12: TypeScript Types

Create `types/index.ts`:

```typescript
export interface User {
  id: string
  email: string
  restaurant_name: string | null
  monthly_budget: number | null
  avatar_url: string | null
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserSettings {
  reorder_multiplier: number
  low_stock_threshold: number
  expiry_warning_days: number
  budget_warning_threshold: number
  email_notifications: boolean
  onboarding_completed: boolean
}

export interface InventoryItem {
  id: string
  user_id: string
  supplier_id: string | null
  name: string
  category: string
  quantity: number
  unit: string
  expiry_date: string | null
  reorder_point: number
  max_stock_level: number | null
  price_per_unit: number
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  user_id: string
  name: string
  category: string
  selling_price: number
  sales_percentage: number
  waste_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  serving_size: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  difficulty_level: 'easy' | 'medium' | 'hard'
  instructions: string | null
  cost_per_serving: number
  selling_price: number
  profit_margin: number
  popularity_score: number
  waste_percentage: number
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  inventory_item_id: string
  quantity_needed: number
  unit: string
  cost_per_unit: number
  created_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  notes: string | null
  rating: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WasteEvent {
  id: string
  user_id: string
  inventory_item_id: string | null
  quantity: number
  unit: string
  estimated_value: number
  reason: WasteReason
  notes: string | null
  recorded_at: string
  created_at: string
}

export type WasteReason =
  | 'expired'
  | 'spoiled'
  | 'overproduction'
  | 'prep_waste'
  | 'damaged'
  | 'customer_return'
  | 'quality_issue'
  | 'other'

export interface Product {
  id: string
  barcode: string
  name: string
  brand: string | null
  category: string | null
  unit: string
  average_price: number
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  type: 'waste_reduction' | 'cost_optimization' | 'inventory_optimization' | 'menu_optimization'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimated_savings: number
  confidence: number
  data_points: string[]
  recommended_actions: string[]
  related_items: RelatedItem[]
  timeframe: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  category: string
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  implementation_date: string | null
  completion_date: string | null
  actual_savings: number | null
  created_at: string
  updated_at: string
}

export interface RelatedItem {
  id: string
  name: string
  type: 'inventory' | 'menu' | 'recipe'
  currentValue: number
  suggestedValue: number
  unit: string
}

export interface WasteAnalysisSnapshot {
  id: string
  user_id: string
  analysis_date: string
  total_inventory_value: number
  monthly_spend: number
  average_waste_percentage: number
  inventory_turnover: number
  cost_efficiency_score: number
  seasonal_factor: number
  data_quality_score: number
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string | null
  email: string | null
  feedback_type: 'bug' | 'feature_request' | 'general'
  message: string
  page_url: string | null
  user_agent: string | null
  created_at: string
}

// Shared result type for all Server Actions
export type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string }

// Subscription status enum (matches PostgreSQL subscription_status type)
export type SubscriptionStatus =
  | 'not_started' | 'incomplete' | 'incomplete_expired'
  | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'

// Input types — used across tiers for service/action function signatures.
// Implementations should derive these from z.infer<typeof schema> where a Zod schema exists.
export type CreateInventoryInput = {
  name: string; category: string; quantity: number; unit: string;
  expiry_date?: string; reorder_point: number; max_stock_level?: number;
  price_per_unit: number; supplier_id?: string;
}
export type CreateRecipeInput = {
  name: string; description?: string | null; category: string; serving_size: number;
  prep_time_minutes?: number | null; cook_time_minutes?: number | null;
  difficulty_level: 'easy' | 'medium' | 'hard'; instructions?: string | null;
  selling_price: number;
}
export type CreateIngredientInput = {
  inventory_item_id: string; quantity_needed: number; unit: string; cost_per_unit: number;
}
export type CreateMenuItemInput = {
  name: string; category: string; selling_price: number;
  sales_percentage?: number; waste_percentage?: number; is_active?: boolean;
}
export type RecordWasteInput = {
  inventory_item_id: string; quantity: number; unit: string;
  reason: WasteReason; notes?: string | null;
}
```

## Step 12b: Create Database Types Stub

Create `types/database.ts`:

```typescript
// This file should be regenerated from Supabase after applying migrations:
//   npx supabase gen types typescript --local > types/database.ts
//
// For now, export a placeholder so imports don't break.
// The actual generated types will replace this after Supabase is connected.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, unknown>
  }
}
```

## Step 13: Create Placeholder Pages

Create minimal placeholder pages so the app builds and routes work:

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'OnPar - Smart Restaurant Inventory Management',
  description: 'Reduce waste by 10-20% and save $500+ monthly with smart inventory tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  )
}
```

`app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight">OnPar</h1>
      <p className="mt-4 text-lg text-[var(--muted-foreground)]">
        Smart Restaurant Inventory Management
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Tier 1 scaffold complete. Building...
      </p>
    </main>
  )
}
```

`app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  })
}
```

## Step 14: Vercel Configuration

`vercel.json`:
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Step 15: Package.json Scripts

Ensure `package.json` has these scripts:
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
    "test:e2e": "playwright test"
  }
}
```

## Step 16: Vitest Configuration

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

## Step 17: .gitignore

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# playwright
test-results/
playwright-report/
```

## Verification Checklist

After completing all steps above, verify:

1. `npm run build` passes with zero errors
2. `npm run type-check` passes
3. `npm run lint` passes
4. `npm run dev` starts the dev server successfully
5. Visiting `http://localhost:3000` shows the placeholder page
6. Visiting `http://localhost:3000/api/health` returns JSON
7. The `supabase/migrations/001_initial_schema.sql` file exists and is valid SQL
8. All files in the project structure exist as specified
9. No files from the old codebase remain (except `.git/`)

## File Summary

Files to create:
```
next.config.ts
tsconfig.json
tailwind.css (or app/globals.css depending on scaffold)
middleware.ts
vercel.json
vitest.config.ts
.env.example
.env.local
.gitignore
package.json (via create-next-app, then modify scripts)
lib/utils.ts
lib/utils/formatting.ts
lib/config.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
lib/supabase/middleware.ts
types/index.ts
types/database.ts
supabase/migrations/001_initial_schema.sql
supabase/seed.sql
app/layout.tsx
app/page.tsx
app/globals.css
app/api/health/route.ts
```
