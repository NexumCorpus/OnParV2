export const stripeProducts = [
  {
    id: 'prod_SlZPyOZMRIQ21i',
    priceId: 'price_1Rq2Gp1bIOlGzW46ggDZ39PC',
    name: 'OnPar Base Subscription',
    description: 'Core inventory management for independent restaurants. Includes stock tracking, menu performance editing, low-stock/expiry alerts, and budget overspend notifications—$ 49/month.',
    price: 49,
    mode: 'subscription' as const,
    features: [
      'Stock tracking and management',
      'Menu performance editing',
      'Low-stock alerts',
      'Expiry notifications',
      'Budget overspend notifications',
      'Email support',
      'Mobile-responsive dashboard'
    ]
  },
  {
    id: 'prod_SlZQgL0DjZST7d',
    priceId: 'price_1Rq2Hf1bIOlGzW46EJxiBwRC',
    name: 'OnPar AI Premium',
    description: 'Advanced AI insights for OnPar users. Includes dynamic waste reduction predictions (e.g., 15% savings) and future ordering optimization. $29/month add-on.',
    price: 29,
    mode: 'subscription' as const,
    features: [
      'Requires Base Subscription',
      'Dynamic waste reduction predictions',
      'Future ordering optimization',
      'Advanced AI insights',
      'Predictive analytics',
      'Priority customer support',
      'Enhanced reporting capabilities'
    ]
  }
] as const;

export type StripeProduct = typeof stripeProducts[number];