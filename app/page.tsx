import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            OnPar
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Smart inventory management for small restaurants. 
            Reduce waste, save money, and optimize your operations.
          </p>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-green-800 mb-2">
                🎯 Cut Food Waste by 10-20%
              </h2>
              <p className="text-green-700">
                Save $500+ monthly with intelligent alerts and AI insights
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-2">
                📱 Mobile-First Design
              </h2>
              <p className="text-blue-700">
                Update inventory from any device, no app downloads required
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-purple-800 mb-2">
                💰 Affordable Pricing
              </h2>
              <p className="text-purple-700">
                Starting at $49/month - pays for itself in the first week
              </p>
            </div>
          </div>
          
          <div className="mt-12 space-x-4">
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </Link>
            <Link 
              href="/api/health"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Health Check
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>✅ Deployment Status: Ready for Vercel</p>
            <p>🚀 Build Version: Simplified for deployment success</p>
          </div>
        </div>
      </div>
    </div>
  )
}