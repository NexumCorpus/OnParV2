# One-Click Deploy to Bolt.new

Deploy OnPar to Bolt.new with one click:

[![Deploy to Bolt](https://bolt.new/button.svg)](https://bolt.new/github.com/your-username/onpar-restaurant-saas)

## Pre-deployment Setup

Before deploying, you'll need:

1. **Supabase Project**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get your project URL and anon key from Settings > API

2. **Stripe Account**
   - Create account at [stripe.com](https://stripe.com)
   - Get publishable and secret keys from Developers > API Keys
   - Create webhook endpoint for production URL

## Post-deployment Setup

After deployment:

1. Set environment variables in your hosting platform
2. Run database migrations in Supabase SQL editor
3. Create Stripe products and update pricing page links
4. Deploy Supabase Edge Functions for email alerts (send-alerts function)
5. Test the application with demo data

See the full README.md for detailed setup instructions.