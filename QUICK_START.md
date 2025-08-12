# OnPar - Quick Start Guide

This guide will get you up and running with the OnPar application in under 10 minutes.

## 🚀 Prerequisites

- Node.js 18+ installed ([download here](https://nodejs.org/))
- Git installed
- Access to the project repository

## 📦 Setup Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd onpar-restaurant-saas

# Run the setup check
npm run setup

# Install dependencies (if not already done)
npm install
```

### 2. Environment Configuration

Copy the environment template and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with these values:

```env
# Supabase (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://kfbtqojxwfeuzobiqydt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYnRxb2p4d2ZldXpvYmlxeWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzI0NTEsImV4cCI6MjA2OTA0ODQ1MX0.OogAoUHJiH_JtDExmLRzZymamHSj7nwaMdilCS2l2cA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYnRxb2p4d2ZldXpvYmlxeWR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MjQ1MSwiZXhwIjoyMDY5MDQ4NDUxfQ.GPo63cycYpwk8ioMLB0aVsZFll8L50F4D3El-JkZLXM

# Stripe (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Resend (get from Resend dashboard)
RESEND_API_KEY=re_your_api_key_here

# App URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

The database should already be configured, but if you need to set it up:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Run the migrations from `supabase/migrations/` in order

### 4. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Application

### Create Your First User

1. Navigate to `/auth`
2. Sign up with an email and password
3. You'll be redirected to the onboarding flow

### Add Sample Data

1. Complete the onboarding process
2. Or manually add inventory items using the dashboard

### Test Core Features

- ✅ Add/edit/delete inventory items
- ✅ Add/edit/delete menu items  
- ✅ View alerts for low stock and expiring items
- ✅ Toggle premium features to see AI insights
- ✅ Test CSV import functionality
- ✅ Check analytics dashboard
- ✅ Test mobile responsiveness

## 🔧 Troubleshooting

### Common Issues

**"Supabase not configured" warning**
- Check your `.env.local` file has correct Supabase keys
- Restart the dev server after changing environment variables

**Authentication errors**
- Verify Supabase project is active
- Check that email confirmation is disabled in Supabase Auth settings

**Database errors**
- Ensure all migrations have been applied
- Check Supabase logs for detailed error messages

**Build errors**
- Run `npm run type-check` to check for TypeScript errors
- Ensure all dependencies are installed

### Getting Help

1. Check the browser console for error messages
2. Review the full `TESTING_GUIDE.md` for detailed testing instructions
3. Check Supabase dashboard for database/auth issues
4. Contact the team for support

## 📁 Project Structure

```
onpar-restaurant-saas/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utility functions and API calls
├── supabase/              # Database migrations and functions
├── docs/                  # Documentation
├── .env.example           # Environment template
└── package.json           # Dependencies and scripts
```

## 🎯 Key Features to Test

1. **Authentication**: Sign up, sign in, profile management
2. **Inventory**: CRUD operations, CSV import, alerts
3. **Menu**: Performance tracking, waste analysis
4. **Analytics**: Charts, insights, trends
5. **Billing**: Subscription management (if Stripe configured)
6. **Mobile**: Responsive design, mobile navigation

## 📱 Mobile Testing

Test the application on mobile devices:
- Bottom navigation should appear
- Forms should be touch-friendly
- Charts should be responsive
- All features should work on small screens

---

**Ready to start?** Run `npm run setup` to check your environment, then `npm run dev` to start developing!