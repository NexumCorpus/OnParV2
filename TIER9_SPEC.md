# TIER 9: Landing Pages, Onboarding & Polish

## Prerequisites
Tiers 1-8 must be complete: Full app with tests and CI.

## Overview
1. Marketing landing page (home)
2. Features page
3. Contact page
4. Onboarding flow for new users
5. Mobile optimization pass
6. Accessibility polish
7. SEO metadata
8. Final Lighthouse optimization

---

## Step 1: Landing Page (Home)

### `app/page.tsx`

### Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, transparent → white on scroll)                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🍽 OnPar          Features  Pricing  Contact    [Login] [Start]│ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ── HERO SECTION ────────────────────────────────────────────────    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Stop Wasting Food.                    ┌──────────────────┐   │ │
│  │  Start Saving Money.                   │                  │   │ │
│  │                                        │  [Dashboard      │   │ │
│  │  Smart inventory management for        │   Preview        │   │ │
│  │  restaurants. Reduce waste by          │   Screenshot]    │   │ │
│  │  10-20% and save $500+ monthly.       │                  │   │ │
│  │                                        └──────────────────┘   │ │
│  │  [Get Started Free]  [See Demo →]                              │ │
│  │                                                                │ │
│  │  ✓ No credit card required  ✓ 14-day free trial               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ── SOCIAL PROOF BAR ────────────────────────────────────────────   │
│  │ Trusted by 200+ restaurants │ ★★★★★ 4.9 rating │ $2M+ saved  │ │
│                                                                      │
│  ── FEATURES GRID (3 columns) ───────────────────────────────────   │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ 📦               │ │ 📉               │ │ 🧠               │    │
│  │ Smart Inventory   │ │ Waste Reduction  │ │ AI Insights      │    │
│  │ Tracking          │ │ Analytics        │ │                  │    │
│  │                   │ │                  │ │ Get actionable   │    │
│  │ Track every item  │ │ Identify waste   │ │ recommendations  │    │
│  │ with real-time    │ │ patterns and     │ │ powered by your  │    │
│  │ alerts for low    │ │ reduce costs     │ │ restaurant's     │    │
│  │ stock & expiry.   │ │ with data-driven │ │ data.            │    │
│  │                   │ │ insights.        │ │                  │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ 🍳               │ │ 📊               │ │ 📱               │    │
│  │ Recipe Cost       │ │ Performance      │ │ Mobile First     │    │
│  │ Analysis          │ │ Dashboards       │ │                  │    │
│  │                   │ │                  │ │ Manage your      │    │
│  │ Calculate profit  │ │ Beautiful charts │ │ inventory from   │    │
│  │ margins and track │ │ showing your     │ │ any device,      │    │
│  │ ingredient costs  │ │ restaurant's     │ │ anywhere.        │    │
│  │ automatically.    │ │ performance.     │ │                  │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                      │
│  ── HOW IT WORKS (3 steps) ──────────────────────────────────────   │
│                                                                      │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐              │
│  │  Step 1  │  ───→  │  Step 2  │  ───→  │  Step 3  │              │
│  │          │        │          │        │          │              │
│  │ Add your │        │ Track    │        │ Save     │              │
│  │ inventory│        │ & analyze│        │ money    │              │
│  │          │        │          │        │          │              │
│  │ Import   │        │ Monitor  │        │ Follow   │              │
│  │ items via│        │ waste,   │        │ AI recs  │              │
│  │ CSV or   │        │ costs,   │        │ to cut   │              │
│  │ add them │        │ and get  │        │ waste by │              │
│  │ manually │        │ AI tips  │        │ 10-20%   │              │
│  └──────────┘        └──────────┘        └──────────┘              │
│                                                                      │
│  ── TESTIMONIALS ─────────────────────────────────────────────────  │
│                                                                      │
│  ┌──────────────────────────────────────┐                           │
│  │  "OnPar helped us reduce waste by    │                           │
│  │   18% in the first month. The AI     │                           │
│  │   insights are spot on."             │                           │
│  │                                      │                           │
│  │   — Chef Marco, Bella Italia         │                           │
│  │   ★★★★★                              │                           │
│  └──────────────────────────────────────┘                           │
│  [← prev]                         [next →]                         │
│                                                                      │
│  ── CTA SECTION ──────────────────────────────────────────────────  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Ready to reduce waste and save money?                         │ │
│  │                                                                │ │
│  │  [Get Started Free]       No credit card required.             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ── FOOTER ───────────────────────────────────────────────────────  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🍽 OnPar          Product     Company      Legal               │ │
│  │                   Features   About        Privacy              │ │
│  │ Smart inventory   Pricing    Contact      Terms                │ │
│  │ management for    Demo       Blog         Cookies              │ │
│  │ restaurants.                                                    │ │
│  │                   © 2026 OnPar. All rights reserved.           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile: Full-width stacked, hero text above preview image, features 1-column, smaller CTA.

---

## Step 2: Features Page

### `app/(marketing)/features/page.tsx`

Detailed feature breakdown with alternating left/right layout sections:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Features                                                            │
│                                                                      │
│  Everything you need to manage your restaurant inventory             │
│                                                                      │
│  ┌────────────────────────────────┐ ┌─────────────────────────────┐ │
│  │                                │ │ 📦 Inventory Tracking       │ │
│  │  [Screenshot/illustration     │ │                             │ │
│  │   of inventory page]          │ │ • Real-time stock levels    │ │
│  │                                │ │ • Automatic expiry alerts  │ │
│  │                                │ │ • Low stock notifications  │ │
│  │                                │ │ • CSV import/export        │ │
│  │                                │ │ • Barcode scanner support  │ │
│  │                                │ │ • Supplier management      │ │
│  └────────────────────────────────┘ └─────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ 📉 Waste Analysis          │ │                                │ │
│  │                             │ │  [Screenshot/illustration     │ │
│  │ • Pattern detection         │ │   of waste page]              │ │
│  │ • Risk level assessment     │ │                                │ │
│  │ • Seasonal trend analysis   │ │                                │ │
│  │ • Savings calculations      │ │                                │ │
│  │ • Industry benchmarking     │ │                                │ │
│  │ • Predictive alerts         │ │                                │ │
│  └─────────────────────────────┘ └────────────────────────────────┘ │
│                                                                      │
│  ... (more feature sections for AI Insights, Recipes, Analytics) ... │
│                                                                      │
│  [Get Started Free →]                                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Step 3: Contact Page

### `app/(marketing)/contact/page.tsx`

```
┌──────────────────────────────────────────────────────────────────────┐
│  Contact Us                                                          │
│                                                                      │
│  ┌────────────────────────────────┐ ┌─────────────────────────────┐ │
│  │  Get in Touch                  │ │ Contact Info                │ │
│  │                                │ │                             │ │
│  │  ┌──────────────────────────┐ │ │ 📧 support@onpar.app       │ │
│  │  │ Name *                    │ │ │                             │ │
│  │  └──────────────────────────┘ │ │ 📍 San Francisco, CA        │ │
│  │  ┌──────────────────────────┐ │ │                             │ │
│  │  │ Email *                   │ │ │ ⏰ Mon-Fri 9am-5pm PST    │ │
│  │  └──────────────────────────┘ │ │                             │ │
│  │  ┌──────────────────────────┐ │ │ Response time: <24 hours   │ │
│  │  │ Subject *             ▼  │ │ │                             │ │
│  │  │ General / Sales / Bug   │ │ │                             │ │
│  │  └──────────────────────────┘ │ │                             │ │
│  │  ┌──────────────────────────┐ │ │                             │ │
│  │  │ Message *                │ │ │                             │ │
│  │  │                          │ │ │                             │ │
│  │  │                          │ │ │                             │ │
│  │  └──────────────────────────┘ │ │                             │ │
│  │                                │ │                             │ │
│  │  [Send Message]                │ │                             │ │
│  └────────────────────────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

Contact form submits to `feedback` table with `feedback_type = 'general'`.

Create `lib/actions/feedback.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function submitFeedback(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    email: formData.get('email') as string,
    feedback_type: (formData.get('subject') as string) || 'general',
    message: formData.get('message') as string,
    page_url: '/contact',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
```

---

## Step 4: Onboarding Flow

**IMPORTANT:** Update the signup page from Tier 2 — change the post-signup redirect from `/dashboard` to `/onboarding`. Check if the user has completed onboarding (e.g., `user.settings.onboarding_completed`) and redirect accordingly:
- New users → `/onboarding`
- Returning users who haven't finished → `/onboarding`
- Users who completed onboarding → `/dashboard`

Add `onboarding_completed: false` to the default user settings JSONB in the database.

### `app/(dashboard)/onboarding/page.tsx`

```
┌──────────────────────────────────────────────────────────────────────┐
│  Welcome to OnPar! Let's set up your restaurant.                    │
│                                                                      │
│  Step 1 of 3                                                         │
│  ████░░░░░░░░                                                        │
│                                                                      │
│  ── Step 1: Restaurant Info ─────────────────────────────────────    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Restaurant Name *                                              │ │
│  │ (pre-filled from signup)                                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Monthly Food Budget ($)                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  What type of restaurant?                                            │
│  [Casual Dining] [Fine Dining] [Fast Food] [Cafe] [Other]          │
│                                                                      │
│  [Next →]                                                            │
│                                                                      │
│  ── Step 2: Add Your First Items ────────────────────────────────    │
│                                                                      │
│  You can add items manually or import from CSV.                      │
│                                                                      │
│  [+ Add Item Manually]    [📥 Import CSV]    [Skip for now]        │
│                                                                      │
│  ── Step 3: Explore Your Dashboard ──────────────────────────────    │
│                                                                      │
│  Quick tour of key features:                                         │
│                                                                      │
│  ┌──────────┐  📊 Your dashboard shows real-time KPIs              │
│  ┌──────────┐  📉 Track waste and get AI recommendations           │
│  ┌──────────┐  💡 AI insights help you save money                  │
│                                                                      │
│  [Go to Dashboard →]                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### Onboarding Server Actions

Create `lib/actions/onboarding.ts`:

```typescript
'use server'

// Save Step 1 data: restaurant_name and monthly_budget
export async function saveOnboardingStep1(formData: FormData): Promise<ActionResult>
// Updates users table: restaurant_name, monthly_budget
// Also saves restaurant type to user.settings JSONB (if desired)

// Called when user clicks "Go to Dashboard" on Step 3
export async function completeOnboarding(): Promise<ActionResult>
// Sets user.settings.onboarding_completed = true via JSONB merge:
// UPDATE users SET settings = settings || '{"onboarding_completed": true}'::jsonb WHERE id = $userId
// Redirects to /dashboard
```

**Middleware integration:** The onboarding redirect is handled in middleware (Tier 2). When `settings.onboarding_completed` is false, the middleware redirects authenticated users to `/onboarding`. When true, it redirects `/onboarding` visitors to `/dashboard`.

---

## Step 5: Marketing Navbar

Create `components/layout/marketing-navbar.tsx`:
- Transparent background, becomes white/dark on scroll
- Logo, nav links (Features, Pricing, Contact), Login button, CTA button
- Mobile: hamburger menu

Create `components/layout/footer.tsx`:
- 4-column layout: Brand, Product, Company, Legal
- Copyright notice

Create `app/(marketing)/layout.tsx`:
- Wraps marketing pages with navbar + footer

---

## Step 6: SEO & Metadata

Update metadata for all pages:

```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: 'OnPar - Smart Restaurant Inventory Management',
  description: 'Reduce food waste by 10-20% and save $500+ monthly. Smart inventory tracking, AI insights, and waste analytics for restaurants.',
  openGraph: {
    title: 'OnPar - Smart Restaurant Inventory Management',
    description: 'Reduce food waste by 10-20% and save $500+ monthly.',
    url: 'https://onpar.app',
    siteName: 'OnPar',
    type: 'website',
  },
}

// app/(marketing)/pricing/page.tsx
export const metadata: Metadata = {
  title: 'Pricing - OnPar',
  description: 'Simple, transparent pricing for restaurant inventory management. Free tier available.',
}

// etc for each page
```

---

## Step 7: Accessibility Polish

- All interactive elements have visible focus indicators (ring-2 ring-brand-500)
- All images have alt text
- Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- Semantic HTML: nav, main, section, article, aside, footer
- Skip-to-content link at top of page
- All form inputs have associated labels
- Error messages linked via aria-describedby
- Charts have aria-labels with summary data
- Keyboard navigation: Tab through all interactive elements
- Screen reader: test with narrator announcements

---

## Step 7b: Notification Service Stub

Create `lib/services/notifications.ts`:

```typescript
// Notification delivery stub — email integration (e.g., Resend, SendGrid)
// can be added later. For now, notifications are in-app only (via alerts and
// the dashboard's recent alerts panel).

export interface Notification {
  id: string
  userId: string
  type: 'low_stock' | 'expiring' | 'budget_warning' | 'insight'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// In-app notification count (shown in topbar bell icon)
// Combines: low stock items + expiring items + unread insights
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  // Aggregates from inventory alerts + waste alerts + pending insights
  // No separate notifications table needed — computed on the fly
}
```

This keeps the notification system simple for MVP. Email delivery can be added post-launch.

---

## Step 8: Performance Optimization

- All images use `next/image` with proper `width`/`height` or `fill`
- Lazy load below-fold content
- Use `loading="lazy"` for images below fold
- Dynamic imports for heavy components (charts):
  ```typescript
  const Chart = dynamic(() => import('@/components/charts/bar-chart'), { ssr: false })
  ```
- Preload critical fonts
- Minimize client-side JavaScript (prefer Server Components)

---

## Step 9: Final README

Create a clean `README.md`:

```markdown
# OnPar - Smart Restaurant Inventory Management

Reduce food waste by 10-20% and save $500+ monthly.

## Tech Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4.2, shadcn/ui
- Supabase (PostgreSQL, Auth, RLS)
- Stripe (payments)
- Recharts (data visualization)
- Vitest + Playwright (testing)

## Getting Started

1. Clone and install:
   ```bash
   npm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase and Stripe credentials
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Scripts
- `npm run dev` — Development server (Turbopack)
- `npm run build` — Production build
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run E2E tests
- `npm run lint` — Lint code
- `npm run type-check` — TypeScript check
```

---

## Verification Checklist

1. `npm run build` passes
2. Landing page renders with all sections
3. Features page shows all feature descriptions
4. Contact form submits to database
5. Onboarding flow guides new users through setup
6. Marketing navbar is sticky, transparent → opaque on scroll
7. Footer renders with all links
8. All pages have proper metadata/SEO tags
9. Lighthouse Performance: 90+
10. Lighthouse Accessibility: 95+
11. Lighthouse Best Practices: 95+
12. Lighthouse SEO: 90+
13. All links work (no 404s)
14. Dark mode works across all pages
15. Mobile responsive on all pages (test at 375px, 768px, 1024px)
16. Skip-to-content link present
17. All tests still pass (`npm run test`, `npm run test:e2e`)
18. README is clean and accurate

## File Summary

```
app/page.tsx (rewrite — full landing page)
app/(marketing)/layout.tsx (rewrite — add marketing navbar + footer)
app/(marketing)/features/page.tsx
app/(marketing)/contact/page.tsx
app/(auth)/signup/page.tsx (modify — redirect to /onboarding)
app/(dashboard)/onboarding/page.tsx
lib/actions/feedback.ts
lib/actions/onboarding.ts
lib/services/notifications.ts
components/layout/marketing-navbar.tsx
components/layout/footer.tsx
components/landing/hero-section.tsx
components/landing/features-grid.tsx
components/landing/how-it-works.tsx
components/landing/testimonials.tsx
components/landing/cta-section.tsx
components/landing/social-proof-bar.tsx
components/contact/contact-form.tsx
components/onboarding/onboarding-flow.tsx
README.md
```
