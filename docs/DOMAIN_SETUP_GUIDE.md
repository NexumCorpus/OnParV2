# Domain Setup Guide: onpar.solutions

This guide will help you connect your `onpar.solutions` domain from GoDaddy to your OnPar application.

## 🚀 Deployment Options

Since your app uses `output: 'export'` in `next.config.js`, you have several deployment options:

### Option 1: Netlify (Recommended)
**Best for**: Easy setup, automatic deployments, built-in forms

### Option 2: Vercel
**Best for**: Next.js optimization, serverless functions

### Option 3: GitHub Pages + Custom Domain
**Best for**: Free hosting, simple static sites

## 📋 Step-by-Step Setup

### Step 1: Choose Your Deployment Platform

#### Option A: Deploy to Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub (recommended)

2. **Connect Your Repository**
   - Click "New site from Git"
   - Choose GitHub and select your OnPar repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `out`

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   NEXT_PUBLIC_APP_URL=https://onpar.solutions
   RESEND_API_KEY=re_BKgravzz_MmKEjMKSMZ5n9YCUh5srojyW
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Note your temporary Netlify URL (e.g., `amazing-app-123456.netlify.app`)

#### Option B: Deploy to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your OnPar repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - Same as Netlify list above
   - Add in Vercel dashboard under Settings > Environment Variables

4. **Deploy**
   - Click "Deploy"
   - Note your temporary Vercel URL (e.g., `onpar-abc123.vercel.app`)

### Step 2: Configure Custom Domain

#### In Netlify:
1. Go to **Site settings > Domain management**
2. Click **Add custom domain**
3. Enter `onpar.solutions`
4. Netlify will provide DNS records to configure

#### In Vercel:
1. Go to **Settings > Domains**
2. Add `onpar.solutions`
3. Vercel will provide DNS records to configure

### Step 3: Configure DNS in GoDaddy

1. **Log into GoDaddy**
   - Go to [godaddy.com](https://godaddy.com)
   - Sign in to your account

2. **Access DNS Management**
   - Go to "My Products"
   - Find `onpar.solutions`
   - Click "DNS" or "Manage DNS"

3. **Configure DNS Records**

   **For Netlify:**
   ```
   Type: CNAME
   Name: www
   Value: [your-netlify-site].netlify.app
   TTL: 1 Hour

   Type: A
   Name: @
   Value: 75.2.60.5
   TTL: 1 Hour
   ```

   **For Vercel:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour

   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 1 Hour
   ```

4. **Save Changes**
   - DNS propagation can take 24-48 hours
   - Use [whatsmydns.net](https://whatsmydns.net) to check propagation

### Step 4: SSL Certificate

Both Netlify and Vercel automatically provide SSL certificates for custom domains. Once DNS propagates:

- **Netlify**: SSL will auto-provision within a few hours
- **Vercel**: SSL will auto-provision within a few hours

### Step 5: Update Application URLs

Once your domain is live, update these settings:

1. **Supabase Auth Settings**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add `https://onpar.solutions` to allowed origins
   - Update redirect URLs to use your domain

2. **Stripe Webhook URL**
   - Go to Stripe Dashboard > Webhooks
   - Update webhook endpoint to: `https://onpar.solutions/api/webhook/stripe`

3. **Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL=https://onpar.solutions` in your deployment

## 🔧 Troubleshooting

### Common Issues:

**"Site not loading"**
- Check DNS propagation with [whatsmydns.net](https://whatsmydns.net)
- Verify DNS records are correct
- Wait up to 48 hours for full propagation

**"SSL Certificate Error"**
- Wait for auto-provisioning (can take a few hours)
- Check that DNS is properly configured
- Contact platform support if issues persist

**"Build Failed"**
- Check environment variables are set correctly
- Verify all required API keys are valid
- Check build logs for specific errors

### DNS Propagation Check:
```bash
# Check if your domain resolves
nslookup onpar.solutions

# Check specific record types
nslookup -type=A onpar.solutions
nslookup -type=CNAME www.onpar.solutions
```

## 📞 Support

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **GoDaddy DNS Help**: [godaddy.com/help](https://godaddy.com/help)
- **OnPar Support**: support@onpar.app

## 🎯 Next Steps After Domain Setup

1. **Test the full application** at `https://onpar.solutions`
2. **Verify email alerts** work with production domain
3. **Test Stripe integration** with your custom domain
4. **Update marketing materials** with your professional domain
5. **Begin beta testing** with your custom domain

---

**Your professional domain will significantly increase credibility and trust with beta testers and potential customers!**