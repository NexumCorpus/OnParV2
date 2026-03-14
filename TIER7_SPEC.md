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
  plan: 'free' | 'starter' | 'professional' | 'enterprise' | null
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
  // Use service_role Supabase client for database operations (no RLS)

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
lib/actions/settings.ts
lib/config.ts (pricing plans)
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
