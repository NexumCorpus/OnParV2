# OnPar Project Structure

## Root Directory Organization
```
onpar-restaurant-saas/
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable React components
├── lib/                    # Business logic and utilities
├── hooks/                  # Custom React hooks
├── supabase/              # Database migrations and Edge Functions
├── docs/                  # Project documentation
├── scripts/               # Build and setup scripts
└── src/                   # Additional source files (Stripe config)
```

## App Router Structure (`app/`)
- **Nested folders** represent routes (e.g., `app/dashboard/` → `/dashboard`)
- **Special files**: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
- **Route groups**: Use `(auth)` syntax for grouping without affecting URL
- **API routes**: Place in `app/api/` directory

## Component Organization (`components/`)
```
components/
├── ui/                     # shadcn/ui components (buttons, cards, etc.)
├── analytics/              # Analytics-specific components
├── billing/                # Stripe/billing components
├── dashboard/              # Dashboard-specific components
├── providers/              # Context providers (theme, auth)
└── [feature-name].tsx      # Standalone feature components
```

## Business Logic (`lib/`)
- **Single responsibility**: Each file handles one domain area
- **Key files**:
  - `supabase.ts` - Database client and types
  - `auth.ts` - Authentication functions
  - `stripe.ts` - Payment processing
  - `utils.ts` - General utilities (cn function)
  - `[domain].ts` - Domain-specific logic (inventory, recipes, etc.)

## Database Structure (`supabase/`)
```
supabase/
├── migrations/             # SQL migration files (timestamped)
└── functions/             # Edge Functions for server-side logic
```

## Naming Conventions

### Files & Folders
- **kebab-case** for folders: `beta-signup/`, `multi-word-feature/`
- **kebab-case** for components: `barcode-scanner.tsx`
- **camelCase** for utilities: `useToast.ts`

### Components
- **PascalCase** for component names: `BarcodeScanner`, `DashboardLayout`
- **Descriptive names**: Prefer `InventoryItemCard` over `ItemCard`

### Database
- **snake_case** for tables and columns: `inventory_items`, `user_id`
- **Plural table names**: `users`, `inventory_items`, `menu_items`

## Import Patterns
```typescript
// External libraries first
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

// Internal imports with @ alias
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
```

## TypeScript Conventions
- **Strict mode enabled**: All types must be defined
- **Database types**: Generated from Supabase schema
- **Component props**: Always type component props interfaces
- **API responses**: Type all API response shapes

## Styling Patterns
- **Tailwind classes**: Use utility classes, avoid custom CSS
- **Component variants**: Use `class-variance-authority` for component variants
- **Responsive design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode**: Support via `next-themes` and Tailwind dark: variants

## Configuration Files
- **Root level configs**: `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- **Package management**: `package.json` with organized scripts
- **Environment**: `.env.example` template, `.env.local` for development

## Documentation Structure (`docs/`)
- **Setup guides**: Step-by-step configuration instructions
- **Testing guides**: Comprehensive testing procedures
- **Deployment**: Platform-specific deployment instructions