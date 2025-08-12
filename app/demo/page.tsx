'use client'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OnPar Demo</h1>
          <p className="text-xl text-gray-600">See how OnPar can transform your restaurant operations</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">▶</span>
              </div>
              <p className="text-gray-600">Demo Video Coming Soon</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Track inventory levels and costs in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
              <p className="text-sm text-gray-600">Get smart recommendations to reduce waste</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-sm text-gray-600">Manage inventory from any device</p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Reduce food waste by 10-20%
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Save $500+ monthly
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                5-minute setup process
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Mobile-first design
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Real-time alerts
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Try OnPar?</h2>
            <p className="text-gray-600 mb-6">
              Join 50+ Charleston restaurants already using OnPar to reduce waste and save money.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Start Free Trial
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                Schedule Demo Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}