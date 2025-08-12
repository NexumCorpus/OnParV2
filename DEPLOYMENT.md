# 🚀 OnPar Deployment Guide

This guide covers deploying the OnPar application to various hosting platforms.

## 📋 Pre-deployment Checklist

- [ ] All environment variables are documented
- [ ] Database migrations are applied
- [ ] Supabase Edge Functions are deployed
- [ ] Stripe products are created and price IDs updated
- [ ] Application builds successfully (`npm run build`)
- [ ] All tests pass
- [ ] Environment variables are configured for production

## 🌐 Deployment Options

### Option 1: Netlify (Recommended for Static Export)

OnPar is configured with `output: 'export'` making it perfect for Netlify deployment.

#### Steps:
1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: out
   ```

3. **Environment Variables**
   Add all production environment variables in Netlify dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
   NEXT_PUBLIC_APP_URL=https://your-domain.netlify.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build completion

### Option 2: Vercel (Optimized for Next.js)

#### Steps:
1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub

2. **Configure**
   - Vercel auto-detects Next.js settings
   - Add environment variables in dashboard

3. **Deploy**
   - Automatic deployment on git push

### Option 3: GitHub Pages (Free Option)

#### Steps:
1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Push the `out` folder to `gh-pages` branch
   - Enable GitHub Pages in repository settings

## 🔧 Production Configuration

### Environment Variables for Production

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (Live Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Email (Production)
RESEND_API_KEY=your_production_resend_key

# App URL (Your Domain)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Supabase Production Setup

1. **Create Production Project**
   - Create a new Supabase project for production
   - Apply all migrations from `supabase/migrations/`

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy send-alerts --project-ref your-prod-ref
   supabase functions deploy stripe-webhook --project-ref your-prod-ref
   ```

3. **Configure Auth Settings**
   - Set site URL to your production domain
   - Configure redirect URLs
   - Disable email confirmation (if desired)

### Stripe Production Setup

1. **Switch to Live Mode**
   - Toggle from test to live mode in Stripe dashboard
   - Get live API keys

2. **Create Production Products**
   - Basic Plan: $50/month
   - Premium Add-on: $10/month
   - Update price IDs in `app/pricing/page.tsx`

3. **Configure Webhooks**
   - Create webhook endpoint: `https://your-domain.com/api/webhook/stripe`
   - Add required events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Environment variables are secure
- [ ] Stripe webhook secrets are configured
- [ ] Supabase RLS policies are enabled
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Content Security Policy is set

### Security Headers

The application includes security headers in `middleware.ts`:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy

## 📊 Monitoring & Analytics

### Application Monitoring

1. **Supabase Dashboard**
   - Monitor database performance
   - Check authentication metrics
   - Review Edge Function logs

2. **Stripe Dashboard**
   - Track subscription metrics
   - Monitor payment success rates
   - Review webhook delivery

3. **Hosting Platform**
   - Monitor build success/failure
   - Check deployment logs
   - Review performance metrics

### Error Tracking

The application includes error logging:
- Client-side error boundaries
- Server-side error handling
- User action tracking for analytics

## 🧪 Post-deployment Testing

### Production Testing Checklist

- [ ] Sign up flow works
- [ ] Authentication is functional
- [ ] Database operations work
- [ ] Email alerts are sent
- [ ] Stripe payments process
- [ ] All pages load correctly
- [ ] Mobile experience is good
- [ ] SSL certificate is valid

### Load Testing

Consider testing with:
- Multiple concurrent users
- Large datasets
- Various device types
- Different network conditions

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=out
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🆘 Troubleshooting

### Common Deployment Issues

**Build Failures**
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies: `npm install`
- Check environment variables

**Runtime Errors**
- Verify API keys are correct
- Check Supabase project status
- Review application logs

**Performance Issues**
- Optimize images and assets
- Enable caching headers
- Monitor database query performance

## 📞 Support

- **Deployment Issues**: Check hosting platform documentation
- **Application Issues**: Review error logs and console
- **Database Issues**: Check Supabase dashboard and logs

---

**Ready to deploy?** Follow the checklist above and choose your preferred hosting platform!