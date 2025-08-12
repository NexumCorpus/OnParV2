# Stripe Integration Setup Guide

This guide will help you complete the Stripe integration for OnPar's subscription billing.

## 🎯 Overview

OnPar uses Stripe for:
- **Subscription billing** (Basic plan: $50/month, Premium add-on: $10/month)
- **Customer portal** for subscription management
- **Webhook handling** for subscription status updates

## 🔧 Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for live payments)
3. Note: You can test with test keys initially

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the **test keys** (start with `pk_test_` and `sk_test_`)

### 3. Create Products in Stripe

#### Basic Plan Product
1. Go to **Products** in Stripe Dashboard
2. Click **"Add product"**
3. Fill in:
   - **Name**: OnPar Basic Plan
   - **Description**: Core inventory management for small restaurants
   - **Pricing**: $50.00 USD, Recurring monthly
   - **Lookup key**: `basic_plan` (important for webhooks)
4. Save and copy the **Price ID** (starts with `price_`)

#### Premium Add-on Product
1. Create another product:
   - **Name**: OnPar AI Sous-Chef Add-on
   - **Description**: Advanced analytics and smart insights
   - **Pricing**: $10.00 USD, Recurring monthly
   - **Lookup key**: `premium_addon`
2. Save and copy the **Price ID**

### 4. Update Environment Variables

Add to your `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 5. Update Price IDs in Code

In `app/pricing/page.tsx`, replace the placeholder price IDs:
```typescript
const plans = [
  {
    name: 'Basic',
    priceId: 'price_your_basic_plan_price_id', // Replace with actual Price ID
    // ...
  },
  {
    name: 'AI Sous-Chef Add-on',
    priceId: 'price_your_premium_addon_price_id', // Replace with actual Price ID
    // ...
  },
]
```

### 6. Set Up Webhooks

#### Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://your-app-domain.com/api/webhook/stripe`
   - For local testing: Use ngrok or similar to expose localhost
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing the Integration

### Test Subscription Flow
1. Start your development server
2. Go to `/pricing` page
3. Click "Subscribe to Basic" or "Subscribe to AI Sous-Chef Add-on"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout and verify:
   - User is redirected to dashboard
   - Subscription status is updated in Supabase
   - User sees premium features (if applicable)

### Test Customer Portal
1. After subscribing, go to profile settings
2. Click "Manage Billing" in the billing section
3. Verify you can:
   - View subscription details
   - Update payment method
   - Cancel subscription
   - Download invoices

### Test Webhooks
1. Make a test subscription
2. In Stripe Dashboard, go to **Developers > Webhooks**
3. Click on your webhook endpoint
4. Check the **"Recent deliveries"** tab
5. Verify events are being sent successfully (200 status)

## 🚀 Going Live

### 1. Switch to Live Keys
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get your live API keys from **Developers > API Keys**
3. Update your production environment variables

### 2. Update Webhook URL
1. Create a new webhook endpoint with your production URL
2. Update the webhook secret in production environment

### 3. Verify Live Products
1. Ensure your products are created in live mode
2. Update price IDs in your production code if different

## 💰 Pricing Strategy

### Current Pricing
- **Basic Plan**: $50/month + $299 one-time setup
- **Premium Add-on**: $10/month (requires Basic plan)

### Setup Fee Handling
The $299 setup fee is mentioned in marketing but handled separately:
- Collect via Stripe invoice after subscription
- Or add as one-time payment during onboarding
- Contact customers directly for setup scheduling

## 🔍 Monitoring & Analytics

### Stripe Dashboard
Monitor key metrics:
- **Monthly Recurring Revenue (MRR)**
- **Churn rate**
- **Failed payments**
- **Customer lifetime value**

### Integration Health
- Monitor webhook delivery success rates
- Track subscription status sync with Supabase
- Watch for failed payment notifications

## 🆘 Troubleshooting

### Common Issues

**Webhook not receiving events**
- Verify endpoint URL is correct and accessible
- Check webhook secret matches your environment variable
- Ensure your server is responding with 200 status

**Subscription status not updating**
- Check webhook events are being processed
- Verify Supabase RLS policies allow updates
- Check server logs for errors in webhook handler

**Checkout not working**
- Verify publishable key is correct
- Check price IDs match your Stripe products
- Ensure CORS is configured for your domain

### Test Cards
Use these for testing:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

## 📞 Support

- **Stripe Support**: Available in Stripe Dashboard
- **OnPar Support**: support@onpar.app
- **Documentation**: [stripe.com/docs](https://stripe.com/docs)

---

**Next Steps**: After completing Stripe setup, test the full subscription flow and move on to Phase 2 beta improvements!