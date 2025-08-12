# 🚀 OnPar Beta Setup Instructions

## Step 1: Install Node.js (Required)

Your system doesn't have Node.js installed yet. Here's how to get it:

### Download & Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (currently 20.x.x)
3. Run the installer and follow the prompts
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your command prompt/PowerShell after installation

### Verify Installation
Open a new PowerShell window and run:
```powershell
node --version
npm --version
```
You should see version numbers (like v20.15.1 and 10.x.x).

## Step 2: Install Project Dependencies

In your project folder, run:
```powershell
npm install
```
This will download all the required packages (may take 2-3 minutes).

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```powershell
   copy .env.example .env.local
   ```

2. Edit `.env.local` with your API keys (see service setup below)

## Step 4: Service Setup (Critical for Beta)

### 🗄️ Supabase (Database & Authentication)
**Why you need it**: Stores restaurant data, handles user accounts
**Cost**: Free tier (perfect for beta)

1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Choose region closest to Charleston, SC (US East)
4. Copy these values to `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`
5. In Supabase SQL Editor, run the migration from `supabase/migrations/20250725193956_blue_snowflake.sql`

### 💳 Stripe (Payment Processing)
**Why you need it**: Handles subscriptions and billing
**Cost**: Free (pay only when you process payments)

1. Go to [stripe.com](https://stripe.com)
2. Create account (use test mode for beta)
3. In Dashboard → Developers → API Keys:
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key → `STRIPE_SECRET_KEY`
4. Create products:
   - "OnPar Basic" - $49/month recurring
   - "OnPar Premium Add-on" - $29/month recurring
5. Set up webhook endpoint (after deployment): `https://your-domain.com/api/webhook/stripe`

### 📧 Resend (Email Alerts)
**Why you need it**: Sends low stock and expiry alerts
**Cost**: Free tier (3,000 emails/month)

1. Go to [resend.com](https://resend.com)
2. Create account
3. Copy API key → `RESEND_API_KEY`
4. For beta, you can use their test domain or add your own

## Step 5: Test Locally

Run the development server:
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Test Checklist:
- [ ] Homepage loads correctly
- [ ] Can navigate to `/auth` and see signup form
- [ ] Can navigate to `/beta-signup` and see beta form
- [ ] No console errors in browser developer tools

## Step 6: Deploy to Netlify (Go Live)

### Option A: Drag & Drop (Easiest)
1. Build your app: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `out` folder to Netlify
4. Add environment variables in Netlify dashboard
5. Your app is live!

### Option B: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `out`
5. Add environment variables
6. Auto-deploy on every push!

## Step 7: Create Demo Account

1. Go to your live app URL
2. Sign up at `/auth` with your email
3. Complete onboarding (restaurant name, budget)
4. In Supabase, find your user ID in `auth.users` table
5. Edit `seed-demo-data.sql` and replace `YOUR_USER_ID_HERE`
6. Run the SQL in Supabase SQL Editor
7. Refresh your dashboard - you now have demo data!

## Step 8: Beta Launch Preparation

### Create Your Pitch Materials
- [ ] 30-second elevator pitch ready
- [ ] Demo account with realistic data
- [ ] Mobile demo on your phone
- [ ] List of 10-20 Charleston restaurants to approach
- [ ] Business cards or contact info ready

### Test Your Demo Flow
1. **Opening** (30 seconds): "We help restaurants cut waste by 15% and save $500+ monthly"
2. **Mobile Demo** (2 minutes): Show adding inventory on phone
3. **Key Features** (1 minute): Alerts, insights, waste tracking
4. **Beta Offer** (30 seconds): "Free access, help us perfect it"
5. **Next Steps** (30 seconds): "Can I set you up today?"

## Troubleshooting

### Common Issues:

**"Module not found" errors:**
```powershell
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```powershell
npm run type-check
# Fix any TypeScript errors shown
npm run build
```

**Environment variables not working:**
- Make sure `.env.local` has no spaces around `=`
- Restart development server after changes
- Check for typos in variable names

**Supabase connection issues:**
- Verify URL and keys are correct
- Check if RLS policies are enabled
- Make sure migrations ran successfully

## Getting Help

### Immediate Support:
- **Email**: beta@onpar.app
- **Phone**: (843) 555-0123
- **Response Time**: Usually within 2-4 hours

### Self-Help Resources:
- `README.md` - General project info
- `BETA_TESTING_GUIDE.md` - For restaurant owners
- `BETA_DEPLOYMENT_CHECKLIST.md` - Technical checklist

## Success Metrics for Your Beta

### Week 1 Goals:
- [ ] App deployed and accessible online
- [ ] Demo account with sample data ready
- [ ] 3-5 restaurants contacted
- [ ] 1-2 restaurants signed up for beta

### Week 2 Goals:
- [ ] 5-10 active beta users
- [ ] Feedback collection system working
- [ ] Mobile experience validated by real users
- [ ] First testimonials collected

### Week 3 Goals:
- [ ] 10+ restaurants in beta program
- [ ] Feature improvements based on feedback
- [ ] Case studies and success stories
- [ ] Expansion plan for beyond Charleston

## Next Steps After Setup

1. **Complete technical setup** (Steps 1-7 above)
2. **Create demo materials** (screenshots, pitch deck)
3. **Identify target restaurants** (make a list of 20)
4. **Practice your demo** (time yourself, refine message)
5. **Start reaching out** (email, phone, in-person visits)

Remember: You're not just selling software, you're solving a real problem that costs restaurants thousands of dollars monthly. Focus on the business value, not the technical features.

**You've got this! 🚀**