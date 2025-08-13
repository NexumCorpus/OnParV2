import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    
    // Mock response for updating insight status
    const updatedInsight = {
      id: params.id,
      status,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({ insight: updatedInsight })
  } catch (error) {
    console.error('Error updating AI insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock response for deleting insight
    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error('Error deleting AI insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}