<div align="center">
  <img src="./nexum-hero.svg" alt="OnPar — restaurant inventory without spreadsheet drift" width="100%" />

  <p><strong>Know what is on hand, what it costs, what is being wasted, and what to order next.</strong></p>

  <p><a href="#product-surface">Product surface</a> · <a href="#local-setup">Local setup</a> · <a href="#verification">Verification</a> · <a href="https://github.com/NexumCorpus">Nexum Corpus</a></p>
</div>

---

OnPar is an operations system for independent restaurants. It brings inventory,
purchasing, suppliers, recipes, waste, analytics, and kitchen-facing workflows
into one calm interface so operators can spend less time reconciling spreadsheets
and more time acting on the numbers.

## The operating question

Restaurant inventory software often records yesterday. OnPar is organized around
the next decision:

- What is running low?
- What changed in cost?
- What should be purchased?
- Where is waste accumulating?
- Which recipes and suppliers are changing margin?
- What does the kitchen need to see right now?

## Product surface

| Surface | Purpose |
|---|---|
| Dashboard | Operational overview and priority signals |
| Inventory | Item-level stock visibility and intake |
| Purchasing | Purchase orders from draft through detail view |
| Suppliers | Vendor records and sourcing context |
| Recipes | Ingredient and costing relationships |
| Waste | Waste capture and trend visibility |
| Analytics | Measured operating patterns |
| Insights | Decision-oriented summaries |
| Kitchen | Focused kitchen-facing workflow |
| Onboarding and settings | Organization setup and configuration |

The repository also includes authentication, Stripe integration points,
Supabase-backed data access, Sentry instrumentation, responsive marketing pages,
and automated unit and end-to-end test surfaces.

## See it in ten seconds

Open [`demo/onpar-demo.html`](./demo/onpar-demo.html) in a browser. It is a
single self-contained file (no network, no install) that walks eight views with
sample data: Dashboard, Inventory, Waste, Purchasing, Recipes, Insights, ROI,
and the Kitchen display. Suppliers, Analytics, Onboarding, and settings are in
the app but not in the demo.

## Local setup

Requirements: Node.js 20+, npm, and a free Supabase project for anything past
the marketing pages.

```bash
git clone https://github.com/NexumCorpus/OnParV2.git
cd OnParV2
npm install
cp .env.example .env.local      # Windows cmd: copy .env.example .env.local
npm run dev
```

With the placeholder values from `.env.example`, the marketing, pricing, and
login pages render at [http://localhost:3000](http://localhost:3000), and app
routes redirect to login. Submitting the login form with those placeholders
shows a Supabase URL error ("Invalid supabaseUrl") until real Supabase values
are set. To sign in and use the app:

1. Create a Supabase project, open its SQL Editor, and run
   [`supabase/setup-database.sql`](./supabase/setup-database.sql) (migrations
   001–005 plus the demo-data function, in one file).
2. Put the project URL, anon key, and service-role key into `.env.local`.
3. Restart `npm run dev` and sign up. For instant signups, turn off
   Authentication → Providers → Email → "Confirm email".

The three Stripe values in `.env.example` are empty, which runs the app without
billing and leaves the rest of it working:

- With all three empty, the paid-plan buttons on `/pricing` are disabled and read
  "Coming Soon".
- If you set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` but leave `STRIPE_SECRET_KEY`
  empty, a signed-in checkout reports "Billing is not configured".

Sentry and log level are optional.

## Verification

```bash
npm run type-check
npm run lint
npm test
npm run build
npx playwright install chromium   # once: downloads the browser the e2e tests use
npm run test:e2e
```

`npm run test:e2e` starts `npm run dev` itself, so it needs the same
`.env.local`. By itself it runs the signed-out specs (every app route redirects
to login, the forgot-password page is reachable, the login and signup forms
render and validate). The signed-in dashboard and inventory specs need a real
Supabase project and an account that has finished onboarding; without one they
are reported as skipped, not passed:

```bash
E2E_EMAIL=you@example.com E2E_PASSWORD=your-password npm run test:e2e
```

Five inventory specs that need seeded data are marked `fixme` and also show as
skipped. A run with credentials records no traces and writes no HTML report,
because both capture typed values; failure snapshots in `test-results/` can
still contain them, so do not share that folder.

CI (`.github/workflows/ci.yml`) runs lint, type-check, `npm test -- --coverage`
(70% thresholds), a build with placeholder values, and the e2e suite. The
signed-in specs run in CI only when the repository defines the
`SUPABASE_E2E_URL`, `SUPABASE_E2E_ANON_KEY`, `E2E_EMAIL`, and `E2E_PASSWORD`
secrets; otherwise they show as skipped in the log.

These are separate gates: a green type-check does not imply the browser workflow
passes, and local tests do not establish that an external Supabase or Stripe
configuration is production-ready.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Supabase authentication and data services
- Stripe billing integration
- Vitest and Playwright
- Sentry and structured logging

## Current posture

This repository contains the application and its deployment configuration. A
public hosted demo is not currently declared in the repository metadata, so the
README intentionally makes no uptime, customer-count, savings, or production
reliability claim.

## Portfolio

OnPar is the commercial product surface inside
[Nexum Corpus](https://github.com/NexumCorpus), an estate focused on verifiable
machine work. The research infrastructure is not required to run OnPar; the
shared principle is narrower: operational claims should be inspectable, and
software should say clearly what it has and has not proved.
