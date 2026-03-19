# TIER 7: Stripe Billing & User Profile/Settings

## Prerequisites
Tier 6 must be complete: Dashboard and analytics functional.

## Overview
1. Stripe checkout integration
2. Subscription management
3. Webhook handler
4. Pricing page
5. User profile & settings page

---

## Step 1: Stripe Service

Create `lib/services/stripe.ts`:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create a checkout session for subscription
export async function createCheckoutSession(params: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string }>

// Create a customer portal session (for managing existing subscription)
export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<{ url: string }>

// Get user's current subscription status
export async function getSubscriptionStatus(userId: string): Promise<{
  isSubscribed: boolean
  plan: 'free' | 'starter' | 'professional' | null
  status: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}>

// Internal: link Supabase user to Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string>
```

---

## Step 2: Stripe Webhook Handler

`app/api/webhook/stripe/route.ts`:

Handle these events:
- `checkout.session.completed` — Create stripe_customers + stripe_subscriptions records
- `customer.subscription.updated` — Update subscription status, period dates
- `customer.subscription.deleted` — Mark subscription as canceled
- `invoice.payment_succeeded` — Log successful payment
- `invoice.payment_failed` — Alert user (update status)

```typescript
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  // Handle events...
  // Use the admin client from lib/supabase/admin.ts (created in Tier 1)
  // which uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
  // import { createAdminClient } from '@/lib/supabase/admin'
  // const supabase = createAdminClient()

  return new Response('OK', { status: 200 })
}
```

---

## Step 3: Pricing Page

### `app/(marketing)/pricing/page.tsx` (public, no auth required)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ┌──────────┐                                  │
│  Simple, transparent   │ Monthly  │  Annual (save 20%)              │
│  pricing               └──────────┘                                  │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │   FREE           │ │   STARTER        │ │  PROFESSIONAL    │    │
│  │                  │ │   ★ Popular      │ │                  │    │
│  │   $0/mo          │ │   $29/mo         │ │   $79/mo         │    │
│  │                  │ │   ($23/mo annual) │ │   ($63/mo annual)│    │
│  │   ──────────     │ │   ──────────     │ │   ──────────     │    │
│  │                  │ │                  │ │                  │    │
│  │ ✓ 50 items max   │ │ ✓ 500 items      │ │ ✓ Unlimited items│    │
│  │ ✓ Basic tracking │ │ ✓ All tracking   │ │ ✓ Everything in  │    │
│  │ ✓ 1 user         │ │ ✓ Waste analysis │ │   Starter        │    │
│  │ ✗ Waste analysis │ │ ✓ AI insights    │ │ ✓ API access     │    │
│  │ ✗ AI insights    │ │ ✓ CSV import     │ │ ✓ Priority       │    │
│  │ ✗ CSV import     │ │ ✓ Email alerts   │ │   support        │    │
│  │                  │ │ ✓ 3 users        │ │ ✓ Custom reports │    │
│  │                  │ │                  │ │ ✓ 10 users       │    │
│  │                  │ │                  │ │                  │    │
│  │ [Get Started]    │ │ [Start Trial]    │ │ [Start Trial]    │    │
│  │  ↑ links to      │ │  ↑ Stripe        │ │  ↑ Stripe        │    │
│  │  /signup         │ │  checkout        │ │  checkout        │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                      │
│  All paid plans include a 14-day free trial. No credit card          │
│  required to start.                                                  │
│                                                                      │
│  ── FAQ ─────────────────────────────────────────────────────       │
│  ▶ Can I change plans anytime?                                       │
│  ▶ What happens after my trial ends?                                │
│  ▶ Do you offer refunds?                                            │
│  ▶ Is my data secure?                                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile: Cards stack vertically, popular plan shown first.

---

## Step 4: Settings Page

### `app/(dashboard)/settings/page.tsx`

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Settings                                                            │
│                                                                      │
│  [Profile]  [Notifications]  [Billing]  [Appearance]                │
│  ─────────                                                           │
│                                                                      │
│  ── Profile Tab ─────────────────────────────────────────────────    │
│                                                                      │
│  ┌──────┐                                                           │
│  │      │  Change avatar                                            │
│  │  👤  │                                                           │
│  └──────┘                                                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Email                                                          │ │
│  │ mario@italyskitchen.com                    (read-only)         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Restaurant Name *                                              │ │
│  │ Mario's Italian Kitchen                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Monthly Budget ($)                                             │ │
│  │ 5000.00                                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [Save Changes]                                                      │
│                                                                      │
│  ── Notifications Tab ────────────────────────────────────────────   │
│                                                                      │
│  Email Notifications           [Toggle: ON ]                        │
│  Low Stock Threshold           [0.8 ▼] × reorder point             │
│  Expiry Warning Days           [7   ▼] days before                  │
│  Budget Warning At             [90% ▼] of monthly budget            │
│  Reorder Multiplier            [2.0 ▼] × reorder point             │
│                                                                      │
│  [Save Notification Settings]                                        │
│                                                                      │
│  ── Billing Tab ──────────────────────────────────────────────────   │
│                                                                      │
│  Current Plan: Starter ($29/month)                                  │
│  Status: Active                                                      │
│  Next billing: April 13, 2026                                       │
│  Payment method: •••• 4242                                          │
│                                                                      │
│  [Manage Subscription]  ← opens Stripe Customer Portal              │
│  [Change Plan]          ← links to /pricing                         │
│                                                                      │
│  ── Appearance Tab ───────────────────────────────────────────────   │
│                                                                      │
│  Theme:  ○ Light  ○ Dark  ● System                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Step 5: Server Actions

Create `lib/actions/settings.ts`:

```typescript
'use server'

export async function updateProfile(formData: FormData): Promise<ActionResult>
export async function updateNotificationSettings(formData: FormData): Promise<ActionResult>
export async function createCheckout(priceId: string): Promise<{ url: string } | { error: string }>
export async function createPortal(): Promise<{ url: string } | { error: string }>
```

---

## Step 6: Pricing Config

Add to `lib/config.ts`:

```typescript
export const PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    limits: { items: 50, users: 1 },
    features: ['Basic tracking', '50 items max', '1 user'],
  },
  starter: {
    name: 'Starter',
    price: { monthly: 29, annual: 23 },
    stripePriceId: { monthly: 'price_xxx', annual: 'price_yyy' },
    limits: { items: 500, users: 3 },
    features: ['All tracking', 'Waste analysis', 'AI insights', 'CSV import', 'Email alerts', '3 users'],
  },
  professional: {
    name: 'Professional',
    price: { monthly: 79, annual: 63 },
    stripePriceId: { monthly: 'price_aaa', annual: 'price_bbb' },
    limits: { items: Infinity, users: 10 },
    features: ['Everything in Starter', 'API access', 'Priority support', 'Custom reports', '10 users'],
  },
} as const
```

---

## Step 7: Plan Limit Enforcement

Create `lib/services/plan-limits.ts`:

```typescript
import { PLANS } from '@/lib/config'

// Check if user can add more items based on their plan
export async function canAddInventoryItem(userId: string): Promise<{
  allowed: boolean
  currentCount: number
  limit: number
  plan: string
}>

// Check if user can add more team members (future)
export async function canAddUser(userId: string): Promise<{
  allowed: boolean
  currentCount: number
  limit: number
}>

// Get user's current plan from subscription status
// Implementation logic:
// 1. Look up stripe_customers for this user_id
// 2. If no record → return 'free'
// 3. Look up stripe_subscriptions by customer_id
// 4. If no subscription with status 'active' or 'trialing' → return 'free'
// 5. Map the subscription's price_id to plan name using PLANS config stripePriceId values
// 6. Return the matched plan key ('starter' | 'professional')
export async function getUserPlan(userId: string): Promise<keyof typeof PLANS>
```

Integrate into inventory server actions — when creating an item, check `canAddInventoryItem()` first and return an error with upgrade prompt if limit is reached. CSV imports must also enforce this limit (check `currentCount + importCount > limit` before inserting).

### Avatar Upload

Add to `lib/actions/settings.ts`:

```typescript
export async function updateAvatar(formData: FormData): Promise<ActionResult>
// 1. Extract file from formData
// 2. Validate: file type must be image/jpeg, image/png, or image/webp
// 3. Validate: max file size 2MB
// 4. Upload to Supabase Storage bucket 'avatars' at path: {userId}/avatar.{ext}
// 5. Use upsert: true to overwrite previous avatar
// 6. Get public URL from Supabase Storage
// 7. Update users.avatar_url with the public URL
// 8. Return { success: true }
```

**Supabase Storage setup:** Create an `avatars` bucket in Supabase Dashboard (or via migration). Set RLS policy: authenticated users can upload/read their own path (`{userId}/*`).

---

## Step 6b: Data Export & Account Management

### Full Data Export

Add "Export My Data" button to the settings page (Profile tab or a dedicated "Data" section).

Add to `lib/actions/settings.ts`:

```typescript
export async function exportAllData(): Promise<ActionResult<{ downloadUrl: string }>>
// 1. Query all user data tables in PARALLEL:
//    - inventory_items (WHERE user_id AND deleted_at IS NULL)
//    - recipes + recipe_ingredients (JOIN)
//    - menu_items
//    - suppliers
//    - waste_events
//    - ai_insights
//    - waste_analysis_snapshots
// 2. Convert each to CSV using lib/utils/csv.ts
// 3. Create JSON file with user profile + settings
// 4. Bundle into ZIP using JSZip (npm install jszip)
// 5. Upload ZIP to Supabase Storage (temp bucket 'exports', 1-hour signed URL)
// 6. Return { success: true, data: { downloadUrl } }
```

**Dependency:** `npm install jszip` (add to TIER 1 install command or install here).

### Account Deletion

Add to settings page — "Danger Zone" section at bottom:

```
┌──────────────────────────────────────────────────────┐
│  ⚠ Danger Zone                                       │
│                                                      │
│  Delete your account and all associated data.        │
│  This action is irreversible.                        │
│                                                      │
│  [Delete Account]  (opens confirmation dialog)       │
└──────────────────────────────────────────────────────┘
```

Confirmation dialog requires typing the user's email address to confirm.

Add to `lib/actions/settings.ts`:

```typescript
export async function deleteAccount(confirmEmail: string): Promise<ActionResult>
// 1. Verify confirmEmail matches the authenticated user's email
// 2. If Stripe subscription exists: cancel it immediately
// 3. Delete Stripe customer record
// 4. Delete all user data (CASCADE handles via user_id FK on most tables)
// 5. Delete uploaded files from Supabase Storage (avatars bucket)
// 6. Delete Supabase auth user via admin client
// 7. Sign out and redirect to homepage
```

### Privacy Compliance Note
These features satisfy:
- **GDPR Article 17** — Right to erasure (account deletion)
- **GDPR Article 20** — Data portability (full data export as CSV/JSON)
- No cookie consent banner needed — Supabase auth cookies are essential (not tracking)

---

## Verification Checklist

1. `npm run build` passes
2. Pricing page renders with 3 plan cards
3. Monthly/Annual toggle switches prices
4. "Start Trial" buttons initiate Stripe Checkout (or show error if no Stripe keys)
5. Webhook handler processes events correctly
6. Settings page shows all 4 tabs
7. Profile updates save to database
8. Notification settings save to user.settings JSONB
9. Billing tab shows subscription status
10. "Manage Subscription" opens Stripe Customer Portal
11. Theme toggle switches between light/dark/system
12. Mobile layout works for all pages

## File Summary

```
lib/services/stripe.ts
lib/services/plan-limits.ts
lib/actions/settings.ts
lib/config.ts (add pricing plans to existing file from Tier 1)
app/api/webhook/stripe/route.ts
app/(marketing)/pricing/page.tsx
app/(dashboard)/settings/page.tsx
components/settings/profile-form.tsx
components/settings/notification-settings.tsx
components/settings/billing-info.tsx
components/settings/appearance-settings.tsx
components/pricing/plan-card.tsx
components/pricing/pricing-toggle.tsx
components/pricing/faq-section.tsx
```
