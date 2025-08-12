'use client'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Choose the plan that fits your restaurant</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Plan</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">$49<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600">Perfect for small restaurants</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Smart inventory tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Low stock alerts
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Basic reporting
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Mobile access
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Email support
              </li>
            </ul>
            
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Start Free Trial
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$78<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600">Basic + AI Premium Add-on</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-blue-500 mr-3">✓</span>
                Everything in Basic
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-3">✓</span>
                AI waste reduction insights
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-3">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-3">✓</span>
                Recipe cost analysis
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-3">✓</span>
                Priority support
              </li>
            </ul>
            
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg p-4">
            <span className="text-green-600 mr-3">🛡️</span>
            <div>
              <div className="font-semibold text-green-800">30-Day Money-Back Guarantee</div>
              <div className="text-sm text-green-600">If food costs don't drop 2%, full refund</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}