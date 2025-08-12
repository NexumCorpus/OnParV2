'use client'

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Mario Rossi',
      restaurant: "Mario's Italian Kitchen",
      quote: 'OnPar helped us reduce food waste by 18% in just 2 months. The smart alerts are a game-changer.',
      savings: '$680/month',
      rating: 5
    },
    {
      name: 'Sophie Chen',
      restaurant: 'Café Bloom',
      quote: 'The mobile interface is perfect for our busy kitchen. We can update inventory on the go.',
      savings: '$420/month',
      rating: 5
    },
    {
      name: 'Carlos Rodriguez',
      restaurant: 'Taco Sol',
      quote: 'Setup was incredibly easy. The CSV import saved us hours of manual data entry.',
      savings: '$550/month',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h1>
          <p className="text-xl text-gray-600">Real results from real restaurants</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600 mb-2">{testimonial.restaurant}</div>
                <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                  Saves {testimonial.savings}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Success Stories</h2>
            <p className="text-gray-600 mb-6">
              Start reducing waste and saving money like these Charleston restaurants
            </p>
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}