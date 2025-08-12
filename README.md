# OnPar - Restaurant Inventory Management

Smart inventory management for small restaurants, cafes, and eateries. Reduce waste by 10-20% and save $500+ monthly.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/onpar-restaurant-saas)

## ⚡ Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd onpar-restaurant-saas
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your Supabase and Stripe keys
   ```

3. **Run Development**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Required for Core Features
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional for Full Features
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 📦 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Deployment:** Vercel

## 🏗️ Project Structure

```
onpar-restaurant-saas/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Business logic and utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
└── supabase/              # Database migrations
```

## 🎯 Features

- **Smart Inventory Tracking** - Real-time stock monitoring
- **Waste Reduction Analytics** - AI-powered insights
- **Mobile-First Design** - Works on any device
- **Recipe Cost Analysis** - Profit margin tracking
- **Automated Alerts** - Low stock & expiry notifications
- **CSV Import/Export** - Bulk data management

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Manual Build
```bash
npm run build
npm start
```

## 📊 API Endpoints

- `GET /api/health` - Health check
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/menu` - Get menu items
- `POST /api/webhook/stripe` - Stripe webhooks

## 🧪 Testing

```bash
npm run type-check    # TypeScript validation
npm run lint         # ESLint checks
npm run build        # Production build test
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- Email: support@onpar.app
- Documentation: [docs.onpar.app](https://docs.onpar.app)
- Issues: [GitHub Issues](https://github.com/your-username/onpar-restaurant-saas/issues)