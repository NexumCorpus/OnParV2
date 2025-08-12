# OnPar Technical Stack

## Framework & Runtime
- **Next.js 13.5.1** with App Router
- **React 18.2.0** with TypeScript
- **Node.js 20.15.1** (specified in engines)
- **Static Export**: Configured with `output: 'export'` for deployment flexibility

## Backend & Database
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Supabase Auth**: Magic link authentication system
- **Supabase Edge Functions**: For email alerts and Stripe webhooks
- **Database Types**: Fully typed with generated TypeScript interfaces

## Styling & UI
- **Tailwind CSS 3.3.3**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives
- **next-themes**: Dark/light mode support
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

## Payments & Integrations
- **Stripe**: Payment processing and subscription management
- **Resend**: Email service for alerts and notifications

## Development Tools
- **TypeScript 5.2.2**: Strict type checking enabled
- **ESLint**: Code linting with Next.js config
- **PostCSS & Autoprefixer**: CSS processing

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Setup & Database
```bash
npm run setup        # Environment check
npm run supabase:setup  # Supabase configuration
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset Supabase database
```

### Deployment
```bash
npm run deploy:functions  # Deploy Supabase Edge Functions
npm run deploy:netlify   # Deploy to Netlify
npm run deploy:preview   # Preview deployment
```

## Build Configuration
- **Static Export**: Builds to `out/` directory
- **Image Optimization**: Disabled for static export
- **Trailing Slash**: Enabled for static hosting
- **TypeScript**: Build errors ignored for deployment flexibility
- **ESLint**: Build warnings ignored for CI/CD

## Environment Variables
Required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`