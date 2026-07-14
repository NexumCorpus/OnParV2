# OnPar Production Recovery Runbook

**Status (2026-07-14):** The deployed app at https://on-par-v2.vercel.app is UP, but its
Supabase backend (`sxecaxzqdpveyykrvpsy.supabase.co`) no longer resolves (DNS NXDOMAIN).
**Nobody can sign up or log in.** Supabase pauses free-tier projects after ~1 week of
inactivity and removes their DNS; the last activity on this repo was 2026-03-20.

The codebase itself is healthy: type-check clean, 168/168 unit tests pass, production
build succeeds. Fixing the backend is a dashboard task that takes ~15 minutes.

---

## Path A — Restore the existing project (try this first)

1. Log in at https://supabase.com/dashboard
2. Find the project `sxecaxzqdpveyykrvpsy` (it will show as **Paused**).
3. Click **Restore project** and wait a few minutes.
4. Verify: `https://on-par-v2.vercel.app/api/health` should now return
   `"database": "connected"` (the health endpoint now performs a real DB probe).
5. All previous data (users, demo data) comes back with it.

If the project is gone (Supabase deletes long-paused free projects), use Path B.

## Path B — Fresh Supabase project

1. **Create project** at https://supabase.com/dashboard → New project.
2. **Run the schema**: open SQL Editor, paste the entire contents of
   [`supabase/setup-database.sql`](supabase/setup-database.sql), run it.
   (It combines migrations 001–003 plus the `seed_demo_data()` function.)
3. **Auth settings** (Authentication → URL Configuration):
   - Site URL: `https://on-par-v2.vercel.app`
   - Redirect URLs: add `https://on-par-v2.vercel.app/**` and `http://localhost:3000/**`
   - Optional for frictionless demos: Authentication → Providers → Email →
     turn **off** "Confirm email" so signups work instantly without an inbox.
4. **Update Vercel env vars** (Vercel → project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (server-only; never expose)
5. **Redeploy** (Vercel → Deployments → Redeploy). Env vars are baked in at build time.
6. Verify `https://on-par-v2.vercel.app/api/health` returns `"database": "connected"`.

## Seed the sales-demo account

1. Sign up at the live site with a demo email (e.g. `demo@onpar.app` alias) and
   complete onboarding.
2. Supabase Dashboard → Authentication → Users → copy the new user's UUID.
3. SQL Editor: `SELECT seed_demo_data('<paste-uuid>');`
   This loads 5 suppliers, 20 inventory items, and 6 recipes so the dashboard,
   analytics, and purchasing screens look alive during a pitch.

## Preventing a repeat pause

- `vercel.json` now includes a daily cron that hits `/api/health`, which performs a
  real Supabase query — that counts as activity and keeps the free project awake.
- The health endpoint returns HTTP 503 with `"database": "unreachable"` when the
  backend is down, so an uptime monitor (e.g. free UptimeRobot on `/api/health`)
  will actually alert instead of seeing a false "healthy".
- Longer term: Supabase Pro ($25/mo) never pauses — worth it the day the first
  restaurant pays.

## Stripe (only needed to take payments)

Set in Vercel when ready: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_WEBHOOK_SECRET`, plus the price IDs `STRIPE_STARTER_MONTHLY_PRICE_ID`,
`STRIPE_STARTER_ANNUAL_PRICE_ID`, `STRIPE_PRO_MONTHLY_PRICE_ID`,
`STRIPE_PRO_ANNUAL_PRICE_ID`. Point the Stripe webhook at
`https://on-par-v2.vercel.app/api/webhook/stripe`. The 14-day trial is already
built into checkout, so you can sell before wiring this up — trials don't require
a card until day 14.
