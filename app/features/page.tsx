'use client'

export default function FeaturesPage() {
  const features = [
    {
      title: 'Smart Inventory Tracking',
      description: 'Track stock levels, expiry dates, and reorder points with intelligent alerts.',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'AI Waste Reduction',
      description: 'Get AI-powered insights to reduce food waste by 10-20% and save money.',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Recipe Cost Analysis',
      description: 'Calculate ingredient costs and optimize menu pricing for maximum profit.',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Mobile-First Design',
      description: 'Update inventory from any device - phone, tablet, or computer.',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Supplier Management',
      description: 'Track supplier performance and automate reordering processes.',
      color: 'bg-red-100 text-red-800'
    },
    {
      title: 'Advanced Analytics',
      description: 'Generate detailed reports and track key performance metrics.',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Small Restaurants</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to reduce waste, save money, and optimize your restaurant operations
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${feature.color}`}>
                Feature {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Join 50+ Charleston restaurants already saving money with OnPar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}