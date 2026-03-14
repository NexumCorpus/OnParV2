# TIER 2: Authentication & Core Dashboard Layout

## Prerequisites
Tier 1 must be complete: Next.js 16 scaffolded, Supabase clients configured, types defined.

## Overview
This tier adds:
1. Login/Signup pages with Supabase Auth
2. Auth middleware to protect dashboard routes
3. Dashboard shell layout (sidebar + topbar + content area)
4. User profile creation on signup
5. Dark mode support via next-themes

---

## Step 1: Install shadcn/ui Components

Initialize shadcn/ui (use the `new-york` style, and the default config). Then add these components:

```bash
npx shadcn@latest init
npx shadcn@latest add button card input label form separator avatar dropdown-menu sheet badge toast tabs dialog select alert-dialog table checkbox progress switch scroll-area tooltip
```

Make sure all UI components live in `components/ui/`.

---

## Step 2: Theme Provider

Create `components/providers/theme-provider.tsx`:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

Create `components/providers/index.tsx`:

```tsx
'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}
```

Update `app/layout.tsx` to wrap children in `<Providers>`.

---

## Step 3: Auth Pages

### Login Page Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     ┌─────────────────────┐                  │
│                     │    🍽  OnPar          │                  │
│                     │                     │                  │
│                     │  Welcome back       │                  │
│                     │  Sign in to manage  │                  │
│                     │  your restaurant    │                  │
│                     │                     │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Email         │  │                  │
│                     │  └───────────────┘  │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Password      │  │                  │
│                     │  └───────────────┘  │                  │
│                     │                     │                  │
│                     │  [  Sign In      ]  │  ← brand-600 bg  │
│                     │                     │                  │
│                     │  ─── or ───         │                  │
│                     │                     │                  │
│                     │  Don't have an      │                  │
│                     │  account? Sign up → │  ← link          │
│                     │                     │                  │
│                     └─────────────────────┘                  │
│                                                              │
│       ← bg-muted (left half)    bg-brand-50 (right half) →  │
│         with feature bullets      decorative gradient        │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):** Full-width card, no split layout. Card takes full width with padding.

### Signup Page Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│                     ┌─────────────────────┐                  │
│                     │    🍽  OnPar          │                  │
│                     │                     │                  │
│                     │  Create your        │                  │
│                     │  account            │                  │
│                     │                     │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Email         │  │                  │
│                     │  └───────────────┘  │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Password      │  │                  │
│                     │  └───────────────┘  │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Confirm Pass  │  │                  │
│                     │  └───────────────┘  │                  │
│                     │  ┌───────────────┐  │                  │
│                     │  │ Restaurant    │  │                  │
│                     │  │ Name          │  │                  │
│                     │  └───────────────┘  │                  │
│                     │                     │                  │
│                     │  [  Create Account] │                  │
│                     │                     │                  │
│                     │  Already have an    │                  │
│                     │  account? Sign in → │                  │
│                     └─────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### Auth Layout

Create `app/(auth)/layout.tsx` — Centered card layout, split screen on desktop (feature highlights on left, form on right).

### Login Implementation — `app/(auth)/login/page.tsx`

- Use react-hook-form + zod for validation
- Email: required, valid email format
- Password: required, min 6 chars
- On submit: call `supabase.auth.signInWithPassword({ email, password })`
- On success: redirect to `/dashboard` using `router.push`
- On error: show toast with error message
- Loading state: disable button, show spinner
- Link to `/signup`

### Signup Implementation — `app/(auth)/signup/page.tsx`

- Use react-hook-form + zod for validation
- Email: required, valid email
- Password: required, min 8 chars, must contain uppercase + number
- Confirm password: must match password
- Restaurant name: required, 2-100 chars
- On submit:
  1. Call `supabase.auth.signUp({ email, password })`
  2. The database trigger (`on_auth_user_created` from Tier 1 migration) auto-creates the user profile row.
  3. After successful signup, update the user's restaurant_name:
     ```ts
     await supabase.from('users').update({
       restaurant_name: restaurantName,
     }).eq('id', user.id)
     ```
  4. Redirect to `/dashboard` (Tier 9 will change this to `/onboarding` for new users)
- On error: show toast
- Link to `/login`

---

## Step 4: Auth Middleware (Route Protection)

Update `middleware.ts` to protect dashboard routes:

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/features', '/contact', '/api/health', '/api/webhook']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response
  }

  // Allow static assets and API routes that aren't protected
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/webhook')) {
    return response
  }

  // Check auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Onboarding redirect — check if authenticated user has completed onboarding
  // (Tier 9 adds the onboarding page; this middleware ensures the redirect works)
  if (user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
    const { data: userData } = await supabase
      .from('users').select('settings').eq('id', user.id).single()
    if (userData && !userData.settings?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }
  // If user completed onboarding but visits /onboarding, redirect to dashboard
  if (user && pathname.startsWith('/onboarding')) {
    const { data: userData } = await supabase
      .from('users').select('settings').eq('id', user.id).single()
    if (userData?.settings?.onboarding_completed) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Step 5: Dashboard Layout

### Desktop Wireframe (>=1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (w-64, fixed)    │  TOPBAR (h-16, sticky)                 │
│                          │  ┌──────────────────────────────────┐   │
│  🍽 OnPar                │  │  🔍 Search...        🔔  👤 User │   │
│                          │  └──────────────────────────────────┘   │
│  ─────────────────       │                                        │
│                          │  CONTENT AREA                          │
│  📊 Dashboard     ←active│  ┌──────────────────────────────────┐   │
│  📦 Inventory            │  │                                  │   │
│  🍳 Recipes              │  │  (Page content renders here)     │   │
│  📉 Waste                │  │                                  │   │
│  💡 Insights             │  │                                  │   │
│  📈 Analytics            │  │                                  │   │
│  🚛 Suppliers            │  │                                  │   │
│                          │  │                                  │   │
│  ─────────────────       │  │                                  │   │
│                          │  │                                  │   │
│  ⚙️ Settings             │  │                                  │   │
│  🚪 Sign Out             │  └──────────────────────────────────┘   │
│                          │                                        │
└────────────────────────────────────────────────────────────────────┘
```

### Tablet Wireframe (768px-1023px)

```
┌───────────────────────────────────────────────────┐
│ SIDEBAR (w-16, icons only, fixed)                 │
│                                                   │
│  🍽                 │  TOPBAR                      │
│                    │  ┌─────────────────────────┐ │
│  📊               │  │ ☰  Search...   🔔  👤   │ │
│  📦               │  └─────────────────────────┘ │
│  🍳               │                              │
│  📉               │  CONTENT AREA                │
│  💡               │  (full remaining width)      │
│  📈               │                              │
│  🚛               │                              │
│  ──               │                              │
│  ⚙️               │                              │
│  🚪               │                              │
└───────────────────────────────────────────────────┘
```

### Mobile Wireframe (<768px)

```
┌────────────────────────────┐
│  TOPBAR (sticky)           │
│  ┌──────────────────────┐  │
│  │ ☰  OnPar       🔔 👤│  │
│  └──────────────────────┘  │
│                            │
│  CONTENT AREA              │
│  (full width, padded)      │
│                            │
│                            │
└────────────────────────────┘

   ☰ opens slide-out Sheet:
┌──────────────────┐
│  🍽 OnPar         │
│                  │
│  📊 Dashboard    │
│  📦 Inventory    │
│  🍳 Recipes      │
│  📉 Waste        │
│  💡 Insights     │
│  📈 Analytics    │
│  🚛 Suppliers    │
│  ──────────────  │
│  ⚙️ Settings     │
│  🚪 Sign Out     │
└──────────────────┘
```

### Implementation

Create `app/(dashboard)/layout.tsx`:

- Server component that fetches the current user
- If no user, redirect to `/login`
- Renders sidebar + topbar + children

Create `components/layout/sidebar.tsx`:
- Client component
- Uses `usePathname()` to highlight active nav item
- Navigation items:
  ```typescript
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Recipes', href: '/recipes', icon: ChefHat },
    { label: 'Waste', href: '/waste', icon: TrendingDown },
    { label: 'Insights', href: '/insights', icon: Lightbulb },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Suppliers', href: '/suppliers', icon: Truck },
  ]
  ```
- Bottom items: Settings (Settings icon), Sign Out (LogOut icon)
- Sign out calls `supabase.auth.signOut()` then redirects to `/login`
- Responsive: full sidebar on desktop, icon-only on tablet, sheet on mobile

Create `components/layout/topbar.tsx`:
- Sticky top bar
- Left: hamburger menu (mobile only), search input
- Right: notification bell (Badge with count), user avatar dropdown
- Avatar dropdown: "Profile", "Settings", separator, "Sign Out"

Create `components/layout/mobile-nav.tsx`:
- Uses shadcn Sheet component
- Triggered by hamburger button in topbar
- Same nav items as sidebar
- Closes on navigation

---

## Step 6: Dashboard Home Page

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                              March 2026 ▼        │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Low      │ │ Expiring │ │ Monthly  │       │
│  │ Items    │ │ Stock    │ │ Soon     │ │ Spend    │       │
│  │          │ │          │ │          │ │          │       │
│  │   47     │ │    5     │ │    8     │ │ $3,240   │       │
│  │ +3 new   │ │ ⚠ alert  │ │ 🔴 urgent│ │ 68% of   │       │
│  │          │ │          │ │          │ │ budget   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────────┐ ┌────────────────────────┐ │
│  │  Recent Activity            │ │  Quick Actions         │ │
│  │                             │ │                        │ │
│  │  • Added 5 lbs tomatoes     │ │  [+ Add Item]          │ │
│  │  • Updated chicken price    │ │  [📊 Run Analysis]     │ │
│  │  • Low stock: Mozzarella    │ │  [📥 Import CSV]       │ │
│  │  • Waste logged: lettuce    │ │  [📤 Export Report]    │ │
│  │  • AI: Reduce pizza waste   │ │                        │ │
│  │                             │ │                        │ │
│  └─────────────────────────────┘ └────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Inventory Status (horizontal bar chart)                 ││
│  │                                                          ││
│  │  Produce   ████████████████████  85%                    ││
│  │  Dairy     ███████████████░░░░░  62%                    ││
│  │  Meat      ██████████░░░░░░░░░░  45% ⚠                 ││
│  │  Pantry    ████████████████████  92%                    ││
│  │  Seafood   ████████░░░░░░░░░░░░  38% 🔴                ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** KPI cards stack 2x2, then activity + quick actions stack vertically, chart is full width.

### Implementation — `app/(dashboard)/page.tsx`

- Server component that fetches:
  - Total inventory items count
  - Low stock items (quantity < reorder_point)
  - Expiring items (expiry_date within 7 days)
  - Monthly spend from waste_analysis_snapshots or calculated from inventory
- Renders 4 KPI cards at top
- Recent activity section (from user_actions or recent changes)
- Quick action buttons (links to other pages or modals)
- For now, use placeholder data if real data isn't available

---

## Step 6b: Marketing Layout Stub

Create `app/(marketing)/layout.tsx` as a simple passthrough layout for now (Tier 9 will add the full marketing navbar and footer):

```tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
```

This ensures marketing pages (pricing in Tier 7, features/contact in Tier 9) have a route group from the start.

## Mobile UX Guidelines (All Tiers)

**Persona:** A head chef doing inventory in a walk-in cooler. Phone in one hand. Hands cold and wet. 20 minutes before service. If he can't understand the screen in 5 seconds, the app has failed.

These rules apply to ALL dashboard pages across all tiers:

1. **No modals on mobile.** Replace all `<Dialog>` / `<Sheet>` with full-screen pages at `<768px`. Modals are impossible with cold fingers and a keyboard pushing content off-screen.
2. **Minimum tap target: 44px.** All buttons, inputs, chips. No exceptions.
3. **Font size: 16px minimum** on all form inputs. Prevents iOS auto-zoom on focus.
4. **Chips over dropdowns.** Categories, statuses, reasons — use horizontally-scrollable pill/chip selectors. Dropdowns require precision taps that fail with wet fingers.
5. **Inline actions on cards.** Quantity adjustments, waste logging — put [−] [+] steppers directly on the card. Don't force navigation to a separate screen for common actions.
6. **Infinite scroll over pagination.** No "Load more" buttons. Auto-load on scroll.
7. **Auto-save with debounce.** Quantity steppers save after 1s debounce. No "Save" button for inline edits.
8. **Back button, not ✕.** Full-screen mobile pages use a large (44px) back-arrow top-left, not a tiny close button.
9. **Price/cost hidden on mobile** for kitchen staff views (inventory, waste). Visible on desktop/analytics.
10. **Batch workflows.** After logging a waste event or adjusting a count, form resets but stays on same screen. Chef is doing 20 items in a row, not one.

---

## Step 7: Placeholder Pages for All Dashboard Routes

Create these pages as simple server components with a heading and "Coming in Tier X" message:

- `app/(dashboard)/inventory/page.tsx` → "Inventory Management — Coming in Tier 3"
- `app/(dashboard)/recipes/page.tsx` → "Recipe Management — Coming in Tier 4"
- `app/(dashboard)/waste/page.tsx` → "Waste Analysis — Coming in Tier 5"
- `app/(dashboard)/insights/page.tsx` → "AI Insights — Coming in Tier 5"
- `app/(dashboard)/analytics/page.tsx` → "Analytics Dashboard — Coming in Tier 6"
- `app/(dashboard)/suppliers/page.tsx` → "Supplier Management — Coming in Tier 3"
- `app/(dashboard)/settings/page.tsx` → "Settings — Coming in Tier 7"

Each should be a simple page:
```tsx
export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      <p className="text-muted-foreground">Coming in Tier 3</p>
    </div>
  )
}
```

## Step 7b: Loading & Error States

Create `app/(dashboard)/loading.tsx` — shown while server components are fetching data:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
```

Create `app/(dashboard)/error.tsx` — error boundary for dashboard pages:

```tsx
'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## Step 8: Sign Out Action

Create `lib/actions/auth.ts`:

```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

---

## Verification Checklist

1. `npm run build` passes with zero errors
2. `npm run type-check` passes
3. `npm run lint` passes
4. Visiting `/login` shows the login form
5. Visiting `/signup` shows the signup form
6. Visiting `/dashboard` without auth redirects to `/login`
7. After logging in, visiting `/login` redirects to `/dashboard`
8. The dashboard layout shows sidebar, topbar, and content area
9. Sidebar highlights the current active route
10. Mobile view shows hamburger menu that opens sheet
11. Sign out button works and redirects to `/login`
12. Dark mode toggle works (if accessible via user dropdown)
13. All placeholder dashboard pages render correctly
14. No TypeScript errors, no ESLint warnings

## File Summary

Files to create/modify:
```
components/providers/theme-provider.tsx
components/providers/index.tsx
components/layout/sidebar.tsx
components/layout/topbar.tsx
components/layout/mobile-nav.tsx
components/ui/  (via shadcn init + add)
app/layout.tsx  (modify to add Providers)
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(marketing)/layout.tsx  (stub for marketing route group)
app/(dashboard)/layout.tsx
app/(dashboard)/loading.tsx   (skeleton UI while server components load)
app/(dashboard)/error.tsx     (error boundary with retry — 'use client')
app/(dashboard)/page.tsx
app/(dashboard)/inventory/page.tsx
app/(dashboard)/recipes/page.tsx
app/(dashboard)/waste/page.tsx
app/(dashboard)/insights/page.tsx
app/(dashboard)/analytics/page.tsx
app/(dashboard)/suppliers/page.tsx
app/(dashboard)/settings/page.tsx
lib/actions/auth.ts
middleware.ts  (modify for route protection)
```
