# OnPar Files to Copy - Complete Checklist

## 📋 Essential Files for bolt.new Deployment

### 🔧 Configuration Files (CRITICAL)
```
📄 package.json              ✅ Optimized dependencies
📄 next.config.js           ✅ Production-ready config
📄 tailwind.config.ts       ✅ Complete styling config
📄 tsconfig.json            ✅ TypeScript configuration
📄 .env.example             ✅ Environment template
📄 README.md                ✅ Setup instructions
```

### 🏗️ App Router Structure
```
📁 app/
├── 📄 layout.tsx           ✅ Root layout with providers
├── 📄 page.tsx             ✅ Landing page
├── 📄 globals.css          ✅ Global styles
├── 📁 dashboard/
│   └── 📄 page.tsx         ✅ Main dashboard
├── 📁 onboarding/
│   └── 📄 page.tsx         ✅ User onboarding flow
├── 📁 profile/
│   └── 📄 page.tsx         ✅ User profile management
├── 📁 beta-signup/
│   └── 📄 page.tsx         ✅ Beta signup form
└── 📁 api/
    ├── 📁 inventory/
    │   └── 📄 route.ts     ✅ Inventory CRUD API
    ├── 📁 menu/
    │   └── 📄 route.ts     ✅ Menu management API
    ├── 📁 notifications/
    │   └── 📄 route.ts     ✅ Notification system API
    ├── 📁 reports/
    │   └── 📄 route.ts     ✅ Report generation API
    ├── 📁 health/
    │   └── 📄 route.ts     ✅ Health check endpoint
    ├── 📁 performance/
    │   └── 📁 report/
    │       └── 📄 route.ts ✅ Performance monitoring
    └── 📁 webhook/
        └── 📁 stripe/
            └── 📄 route.ts ✅ Stripe webhook handler
```

### 🎨 Component Library
```
📁 components/
├── 📁 ui/                  ✅ Reusable UI primitives
│   ├── 📄 button.tsx
│   ├── 📄 card.tsx
│   ├── 📄 input.tsx
│   ├── 📄 data-table.tsx   ✅ Advanced data table
│   ├── 📄 metric-card.tsx  ✅ Analytics cards
│   ├── 📄 error-boundary.tsx ✅ Error handling
│   ├── 📄 loading-spinner.tsx ✅ Loading states
│   └── 📄 [30+ other UI components]
├── 📁 dashboard/
│   ├── 📄 help-center.tsx
│   ├── 📄 search-command.tsx
│   ├── 📄 mobile-nav.tsx
│   └── 📄 breadcrumb-nav.tsx
├── 📁 inventory/
│   └── 📄 advanced-inventory-manager.tsx ✅ Complete inventory system
├── 📁 analytics/
│   └── 📄 comprehensive-analytics.tsx ✅ Analytics dashboard
├── 📁 notifications/
│   └── 📄 notification-center.tsx ✅ Real-time notifications
├── 📁 recipes/
│   └── 📄 recipe-manager.tsx ✅ Recipe management
├── 📁 suppliers/
│   └── 📄 supplier-manager.tsx ✅ Supplier management
├── 📁 reports/
│   └── 📄 report-generator.tsx ✅ Report generation
└── 📁 providers/
    └── 📄 theme-provider.tsx ✅ Theme management
```

### 🧠 Business Logic Layer
```
📁 lib/
├── 📄 supabase.ts          ✅ Database client & types
├── 📄 stripe.ts            ✅ Payment processing
├── 📄 auth.ts              ✅ Authentication logic
├── 📄 database.ts          ✅ Database operations
├── 📄 api-client.ts        ✅ HTTP client with retry
├── 📄 validation.ts        ✅ Zod schemas
├── 📄 config.ts            ✅ App configuration
├── 📄 utils.ts             ✅ Utility functions
├── 📄 performance-monitor.ts ✅ Performance tracking
├── 📄 auth-middleware.ts   ✅ API middleware
├── 📄 test-utils.ts        ✅ Testing utilities
├── 📄 notifications.ts     ✅ Notification system
├── 📄 inventory.ts         ✅ Inventory logic
├── 📄 menu.ts              ✅ Menu management
├── 📄 recipes.ts           ✅ Recipe calculations
├── 📄 ai-insights.ts       ✅ AI recommendations
├── 📄 csv.ts               ✅ CSV import/export
├── 📄 security.ts          ✅ Security utilities
├── 📄 rate-limiter.ts      ✅ Rate limiting
├── 📄 error-logging.ts     ✅ Error tracking
└── 📄 environment-check.ts ✅ Environment validation
```

### 🎣 Custom React Hooks
```
📁 hooks/
├── 📄 use-inventory.ts     ✅ Inventory state management
├── 📄 use-notifications.ts ✅ Notification system
├── 📄 use-async.ts         ✅ Async state management
├── 📄 use-debounce.ts      ✅ Performance optimization
├── 📄 use-local-storage.ts ✅ Local storage management
└── 📄 use-toast.ts         ✅ Toast notifications
```

### 📊 Type Definitions
```
📁 types/
└── 📄 index.ts             ✅ Complete type definitions
```

### 🗄️ Database & Functions
```
📁 supabase/
├── 📁 migrations/          ✅ Database schema
└── 📁 functions/           ✅ Edge functions
    ├── 📁 send-alerts/
    ├── 📁 stripe-checkout/
    └── 📁 stripe-webhook/
```

### 📚 Documentation
```
📄 DEPLOYMENT_GUIDE.md      ✅ Complete deployment guide
📄 OPTIMIZATION_SUMMARY.md  ✅ Performance improvements
📄 BOLT_DEPLOYMENT_STEPS.md ✅ Step-by-step instructions
📄 SETUP_INSTRUCTIONS.md    ✅ Setup guide
📄 BETA_TESTING_GUIDE.md    ✅ Testing procedures
📄 TESTING_VALIDATION_REPORT.md ✅ Test results
📄 COMPREHENSIVE_ENHANCEMENTS.md ✅ Feature overview
📄 BETA_LAUNCH_SUMMARY.md   ✅ Launch summary
📄 PITCH_DECK.md            ✅ Business overview
```

### 🎯 Development Tools
```
📁 .vscode/
└── 📄 launch.json          ✅ Debug configuration

📁 .kiro/
└── 📁 steering/
    ├── 📄 product.md       ✅ Product guidelines
    ├── 📄 structure.md     ✅ Code structure
    └── 📄 tech.md          ✅ Tech stack info
```

### 🚀 Scripts & Setup
```
📄 setup-beta.js           ✅ Beta setup script
```

## 📦 Total File Count: 100+ Files

### Priority Levels:

#### 🔴 CRITICAL (Must Have):
- All configuration files (package.json, next.config.js, etc.)
- All app/ directory files
- Core components (ui/, dashboard/, inventory/, analytics/)
- Essential lib/ files (supabase.ts, auth.ts, database.ts, api-client.ts)
- Type definitions (types/index.ts)

#### 🟡 IMPORTANT (Highly Recommended):
- All custom hooks
- Remaining components (notifications/, recipes/, suppliers/, reports/)
- All lib/ utilities
- Supabase migrations and functions
- Documentation files

#### 🟢 OPTIONAL (Nice to Have):
- Development tools (.vscode/, .kiro/)
- Additional documentation
- Setup scripts

## 🎯 Recommended Deployment Strategy:

### Option 1: GitHub → bolt.new (BEST)
1. Upload ALL files to GitHub repository
2. Import entire repo to bolt.new
3. Configure environment variables
4. Deploy

### Option 2: Manual Copy (If needed)
1. Copy CRITICAL files first
2. Test basic functionality
3. Add IMPORTANT files
4. Add OPTIONAL files as needed

Both approaches will give you a fully functional, production-ready OnPar Restaurant SaaS application!