// Application configuration and constants

export const APP_CONFIG = {
  name: 'OnPar',
  description: 'Smart inventory management for small restaurants',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://onpar.app',
  supportEmail: 'support@onpar.app',
  company: 'OnPar Inc.',
  
  // Feature flags
  features: {
    aiInsights: true,
    advancedAnalytics: true,
    bulkOperations: true,
    csvImportExport: true,
    realTimeNotifications: true,
    mobileApp: false,
    apiAccess: false,
    whiteLabeling: false,
    multiLocation: false,
    advancedReporting: true,
    inventoryForecasting: true,
    supplierIntegration: true,
    recipeCosting: true,
    wasteTracking: true,
    budgetManagement: true,
    performanceMonitoring: true
  },

  // Subscription plans
  plans: {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 49,
      interval: 'month',
      features: [
        'Core inventory management',
        'Basic reporting',
        'Email notifications',
        'Up to 1,000 items',
        'Basic support'
      ],
      limits: {
        inventoryItems: 1000,
        users: 3,
        locations: 1,
        apiCalls: 1000,
        storage: '1GB'
      }
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 78, // $49 + $29 add-on
      interval: 'month',
      features: [
        'Everything in Basic',
        'AI-powered insights',
        'Advanced analytics',
        'Recipe cost analysis',
        'Waste reduction recommendations',
        'Supplier management',
        'Priority support'
      ],
      limits: {
        inventoryItems: 10000,
        users: 10,
        locations: 3,
        apiCalls: 10000,
        storage: '10GB'
      }
    }
  },

  // Default settings
  defaults: {
    lowStockThreshold: 10,
    expiryWarningDays: 7,
    budgetWarningThreshold: 80, // percentage
    wasteThreshold: 5, // percentage
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'America/New_York',
    language: 'en',
    theme: 'system',
    
    // Notification defaults
    notifications: {
      email: true,
      sms: false,
      push: true,
      lowStock: true,
      expiring: true,
      budget: true,
      waste: true,
      supplier: true,
      aiInsights: true,
      system: true
    },

    // Pagination defaults
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    }
  },

  // API configuration
  api: {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    rateLimit: {
      requests: 100,
      window: 60000 // 1 minute
    }
  },

  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    csvMaxRows: 10000
  },

  // Performance thresholds
  performance: {
    pageLoadWarning: 3000, // ms
    apiResponseWarning: 1000, // ms
    memoryWarning: 50 * 1024 * 1024, // 50MB
    bundleSizeWarning: 5 * 1024 * 1024 // 5MB
  },

  // Security settings
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    requireMFA: false,
    allowedOrigins: [
      'https://onpar.app',
      'https://www.onpar.app',
      'https://app.onpar.app'
    ]
  },

  // External services
  services: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: 'noreply@onpar.app',
      fromName: 'OnPar'
    }
  },

  // UI constants
  ui: {
    sidebarWidth: 280,
    headerHeight: 64,
    mobileBreakpoint: 768,
    maxContentWidth: 1200,
    
    // Animation durations
    animations: {
      fast: 150,
      normal: 300,
      slow: 500
    },

    // Z-index layers
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080
    }
  },

  // Categories and options
  categories: {
    inventory: [
      'Proteins',
      'Produce',
      'Dairy',
      'Dry Goods',
      'Beverages',
      'Condiments',
      'Frozen',
      'Cleaning Supplies',
      'Other'
    ],
    menu: [
      'Appetizers',
      'Salads',
      'Soups',
      'Main Courses',
      'Sides',
      'Desserts',
      'Beverages',
      'Specials'
    ],
    cuisine: [
      'American',
      'Italian',
      'Mexican',
      'Asian',
      'Mediterranean',
      'French',
      'Indian',
      'Thai',
      'Japanese',
      'Other'
    ],
    restaurantSizes: [
      'Small (1-25 seats)',
      'Medium (26-75 seats)',
      'Large (76-150 seats)',
      'Very Large (150+ seats)'
    ]
  },

  // Units of measurement
  units: {
    weight: ['oz', 'lb', 'g', 'kg'],
    volume: ['fl oz', 'cup', 'pt', 'qt', 'gal', 'ml', 'l'],
    count: ['each', 'dozen', 'case', 'box', 'bag'],
    length: ['in', 'ft', 'cm', 'm']
  },

  // Validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    inventory: {
      nameMaxLength: 100,
      quantityMax: 999999,
      priceMax: 99999.99,
      reorderPointMax: 99999
    },
    recipe: {
      nameMaxLength: 100,
      servingsMax: 100,
      timeMax: 1440, // 24 hours in minutes
      instructionsMax: 10,
      ingredientsMax: 50
    }
  },

  // Error messages
  errors: {
    generic: 'An unexpected error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    rateLimit: 'Too many requests. Please wait and try again.',
    maintenance: 'The system is currently under maintenance.'
  },

  // Success messages
  success: {
    saved: 'Changes saved successfully',
    created: 'Item created successfully',
    updated: 'Item updated successfully',
    deleted: 'Item deleted successfully',
    imported: 'Data imported successfully',
    exported: 'Data exported successfully',
    emailSent: 'Email sent successfully',
    passwordReset: 'Password reset email sent'
  }
}

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  APP_CONFIG.api.timeout = 30000 // Longer timeout for development
  APP_CONFIG.performance.pageLoadWarning = 5000 // More lenient in dev
}

if (process.env.NODE_ENV === 'production') {
  APP_CONFIG.features.performanceMonitoring = true
}

// Helper functions
export function getFeatureFlag(feature: keyof typeof APP_CONFIG.features): boolean {
  return APP_CONFIG.features[feature] ?? false
}

export function getPlanFeatures(planId: string) {
  return APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans]?.features ?? []
}

export function getPlanLimits(planId: string) {
  return APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans]?.limits ?? {}
}

export function isFeatureAvailable(feature: string, userPlan: string): boolean {
  const planFeatures = getPlanFeatures(userPlan)
  return planFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()))
}

export function formatCurrency(amount: number, currency = APP_CONFIG.defaults.currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatDate(date: Date | string, format = APP_CONFIG.defaults.dateFormat): string {
  const d = new Date(date)
  
  switch (format) {
    case 'DD/MM/YYYY':
      return d.toLocaleDateString('en-GB')
    case 'YYYY-MM-DD':
      return d.toISOString().split('T')[0]
    default:
      return d.toLocaleDateString('en-US')
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return APP_CONFIG.errors.generic
}

export default APP_CONFIG