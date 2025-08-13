import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock AI insights for beta demo
    const insights = [
      {
        id: '1',
        title: 'Reduce Pizza Waste by 35%',
        description: 'Your Margherita Pizza has 8.2% waste rate, 3.2% above optimal. Implementing portion control could save $180/month.',
        impact: 'high',
        savings: 180,
        category: 'Waste Reduction',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Optimize Rice Ordering',
        description: 'Your jasmine rice inventory turns over 2.3x monthly but you order weekly. Bulk ordering could reduce costs by $95/month.',
        impact: 'medium',
        savings: 95,
        category: 'Procurement',
        status: 'pending'
      }
    ]
    
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Mock response for generating insights
    const insights = [
      {
        id: '3',
        title: 'New Insight Generated',
        description: 'Fresh analysis of your inventory patterns reveals new optimization opportunities.',
        impact: 'medium',
        savings: 120,
        category: 'Analysis',
        status: 'pending'
      }
    ]
    
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}