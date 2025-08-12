# 🍽️ OnPar - Restaurant Inventory Management SaaS

OnPar is a smart inventory management system designed specifically for small restaurants, cafes, and eateries. Reduce waste by 10-20% and optimize your operations with intelligent alerts and insights.

## 🚀 Features

- **Smart Inventory Tracking**: Track quantities, expiry dates, and reorder points
- **Intelligent Alerts**: Low stock and expiry notifications via email and in-app
- **Menu Performance**: Track sales and waste percentages for menu optimization
- **Budget Monitoring**: Set monthly budgets and get overspend alerts
- **Mobile-First Design**: Manage inventory on-the-go from any device
- **Smart Insights** (Premium): Advanced analytics for waste reduction
- **Multi-tenant SaaS**: Secure user isolation with Supabase RLS

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe Checkout & Customer Portal
- **Deployment**: Vercel/Netlify ready

## 📦 Quick Start

> **For Co-founders/Developers**: If you're setting up this project for the first time, start with the [QUICK_START.md](./QUICK_START.md) guide for a streamlined setup process.

### Standard Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd onpar
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
# Quick setup check (optional)
npm run setup

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual API keys
```

**Required Keys:**
- Supabase: Create project at [supabase.com](https://supabase.com)
- Stripe: Get keys from [stripe.com](https://stripe.com) dashboard
- Resend: Get API key from [resend.com](https://resend.com) for email alerts

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Run the migration in your Supabase SQL editor:
```sql
-- Copy and paste contents from supabase/migrations/20250725193956_blue_snowflake.sql
```

**Alternative**: Use Supabase CLI (recommended):
```bash
supabase link --project-ref your_project_ref
supabase db push
```

2. (Optional) Add seed data for testing:
```sql
-- Copy and paste contents from seed.sql
```

### 4. Stripe Products Setup

**IMPORTANT**: You must create actual Stripe products and update the price IDs in the code.

See `docs/STRIPE_SETUP_GUIDE.md` for detailed instructions.

**Basic Plan ($50/month)**
- Product Name: "OnPar Basic"
- Price: $40/month recurring
- Lookup Key: `basic_plan`
- Update `priceId` in `app/pricing/page.tsx`

**AI Sous-Chef Add-on ($10/month)**
- Product Name: "OnPar Premium Add-on" 
- Lookup Key: `premium_addon`
- Update `priceId` in `app/pricing/page.tsx`

**Webhook Setup**:
- Create webhook endpoint: `https://your-domain.com/api/webhook/stripe`
- Add webhook secret to environment variables

### 5. Deploy Edge Functions

Deploy the Supabase Edge Functions for email alerts and Stripe webhooks:

```bash
# Install Supabase CLI
npm install -g supabase

# Deploy functions
supabase functions deploy send-alerts
supabase functions deploy stripe-webhook
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔧 Development Scripts

```bash
npm run setup          # Check prerequisites and environment
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript types
```

## 🧪 Beta Testing Guide

See `docs/BETA_TESTING_GUIDE.md` for comprehensive testing instructions.

### For Beta Testers:

1. **Sign Up**: Go to `/auth` and enter your email
2. **Onboarding**: Complete the setup wizard:
   - Enter restaurant name and monthly budget
   - Configure alert settings with recommended defaults
   - Add initial inventory items (manual entry or CSV import)
   - Add menu items with sales percentages
3. **Dashboard**: 
   - Add/edit inventory items
   - Use CSV import for bulk data entry
   - Monitor alerts and estimated savings
   - View analytics charts and trends
4. **Test Alerts**: 
   - Add items with low quantities (below reorder point)
   - Add items with near expiry dates
   - Exceed 90% of monthly budget
5. **Analytics**: 
   - View inventory value trends
   - Monitor waste reduction progress
   - Analyze menu performance data

### Demo Users (if using seed data):

- **mario@italyskitchen.com** - Mario's Italian Kitchen (Premium)
- **chen@dragonwok.com** - Dragon Wok Express (Basic)
- **sophie@cafebloom.com** - Cafe Bloom (Premium)
- **carlos@tacosol.com** - Taco Sol (Basic)
- **raj@spiceroute.com** - Spice Route (Premium)

## 💳 Billing & Subscription

### Installation Fee
- One-time $299 setup fee (mentioned on pricing page)
- Includes personalized onboarding, data migration, and team training
- Contact support after subscribing for white-glove setup

### Plans
- **Basic ($50/month)**: Core inventory management features
- **AI Sous-Chef Add-on ($10/month)**: 28-35% potential cost savings with AI insights

### Premium Features

**Demo Mode**: The application works in demo mode without Supabase configuration for UI testing.

**Full Functionality**: Requires proper Supabase, Stripe, and Resend configuration.

**Testing Premium Features**: 
- Toggle the "Premium AI" switch in the dashboard
- View advanced analytics and insights
- Test smart waste reduction recommendations

Toggle the "Premium AI" switch in the dashboard to simulate:
- Smart waste reduction insights with 10-20% potential cost savings
- Advanced analytics dashboard
- Advanced reporting capabilities

## 🚀 Deployment

### Quick Deploy Options (Updated)

1. **Netlify** (Recommended - One-click deploy ready)
2. **Vercel** (Optimized for Next.js - Auto-deploy from GitHub)
3. **GitHub Pages** (Free option)

### One-Click Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/onpar-restaurant-saas)

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username after uploading to GitHub.

The application is configured with `output: 'export'` in `next.config.js` for static deployment compatibility.

### Build Command
```bash
npm run build
```

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `out`
4. Add environment variables in Netlify dashboard

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 🧪 Testing & Quality Assurance

### Automated Testing
- TypeScript type checking: `npm run type-check`
- ESLint code quality: `npm run lint`
- Build verification: `npm run build`

### Manual Testing
- Follow the comprehensive [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Test all user flows from sign-up to data management
- Verify mobile responsiveness and accessibility features
- Test with sample data and edge cases
- Validate all alert systems and AI insights

## 📧 Support & Contact

- **Email**: support@onpar.app
- **Beta Support**: For $299 installation assistance
- **Bug Reports**: Create GitHub issues
- **Feature Requests**: Contact support team

## 👥 For Developers

- **Setup**: Start with [QUICK_START.md](./QUICK_START.md)
- **Testing**: Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Architecture**: Review `lib/` folder for core business logic

## 🔒 Security & Privacy

- User data isolation via Supabase Row Level Security (RLS)
- Secure authentication with magic links
- HTTPS enforced in production
- PCI compliant payment processing via Stripe

### Security Features
- Rate limiting on API endpoints
- Input sanitization and validation
- CORS protection
- Content Security Policy (CSP)
- SQL injection prevention via parameterized queries

## 📈 Roadmap

- [ ] AI integration for dynamic waste predictions (future release)
- [ ] Actual barcode scanning (camera + image recognition)
- [ ] Mobile app (React Native)
- [ ] Expansion to bodegas, gyms, and other small businesses
- [ ] Supplier integrations
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

### Current Status
- ✅ Core inventory management
- ✅ Menu performance tracking
- ✅ Alert system with email notifications
- ✅ Basic AI insights and analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Ensure accessibility compliance
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style and patterns
- Test thoroughly before submitting PRs

## 📄 License

Copyright © 2025 OnPar. All rights reserved.

---

**Built with ❤️ for small restaurant owners**