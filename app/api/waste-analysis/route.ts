import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock waste analysis data for beta demo
    const wasteAnalysis = {
      totalInventoryValue: 12450,
      monthlySpend: 8200,
      averageWastePercentage: 6.8,
      wasteReduction: 18.5,
      monthlySavings: 1250,
      topWasteItems: [
        {
          name: 'Margherita Pizza',
          wastePercentage: 6.2,
          previousWaste: 8.5,
          monthlyCost: 180,
          reduction: 27.1
        },
        {
          name: 'Fresh Basil',
          wastePercentage: 12.3,
          previousWaste: 18.7,
          monthlyCost: 65,
          reduction: 34.2
        }
      ],
      insights: [
        {
          title: 'Significant Improvement',
          description: 'Your waste reduction of 18.5% is above industry average',
          type: 'success'
        }
      ]
    }
    
    return NextResponse.json(wasteAnalysis)
  } catch (error) {
    console.error('Error fetching waste analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const analysisData = await request.json()
    
    // Mock response for creating waste analysis
    const analysis = {
      id: 'analysis_' + Date.now(),
      ...analysisData,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error creating waste analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}