import { NextRequest, NextResponse } from 'next/server'
import { secureApiRoute, sanitizeInput } from '@/lib/security-middleware'

export const dynamic = 'force-dynamic'

async function handleGet(request: NextRequest) {
  // Mock AI insights for beta demo with sanitized data
  const insights = [
    {
      id: '1',
      title: sanitizeInput('Reduce Pizza Waste by 35%'),
      description: sanitizeInput('Your Margherita Pizza has 8.2% waste rate, 3.2% above optimal. Implementing portion control could save $180/month.'),
      impact: 'high',
      savings: 180,
      category: sanitizeInput('Waste Reduction'),
      status: 'pending'
    },
    {
      id: '2',
      title: sanitizeInput('Optimize Rice Ordering'),
      description: sanitizeInput('Your jasmine rice inventory turns over 2.3x monthly but you order weekly. Bulk ordering could reduce costs by $95/month.'),
      impact: 'medium',
      savings: 95,
      category: sanitizeInput('Procurement'),
      status: 'pending'
    }
  ]
  
  return NextResponse.json({ insights })
}

export async function GET(request: NextRequest) {
  return secureApiRoute(request, handleGet)
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