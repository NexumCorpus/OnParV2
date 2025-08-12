'use client'

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Square POS', status: 'Available', description: 'Sync sales data automatically' },
    { name: 'Toast POS', status: 'Available', description: 'Real-time menu integration' },
    { name: 'Sysco', status: 'Coming Soon', description: 'Direct supplier ordering' },
    { name: 'US Foods', status: 'Coming Soon', description: 'Automated purchasing' },
    { name: 'QuickBooks', status: 'Available', description: 'Financial data sync' },
    { name: 'Stripe', status: 'Available', description: 'Payment processing' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Integrations</h1>
          <p className="text-xl text-gray-600">Connect OnPar with your existing tools</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  integration.status === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {integration.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{integration.description}</p>
              <button 
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  integration.status === 'Available'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={integration.status !== 'Available'}
              >
                {integration.status === 'Available' ? 'Connect' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}