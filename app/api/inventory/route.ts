import { NextRequest, NextResponse } from 'next/server'
import { createInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem } from '@/lib/inventory'
import { getCurrentUser } from '@/lib/auth'
import { logError, logUserAction } from '@/lib/error-logging'

export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await getInventoryItems(user.id)
    
    if (error) {
      logError(error, 'api_inventory_get', user.id)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    logUserAction('inventory_fetched', { count: data?.length || 0 }, user.id)
    return NextResponse.json({ data })
  } catch (error) {
    logError(error as Error, 'api_inventory_get')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const itemData = { ...body, user_id: user.id }

    const { data, error } = await createInventoryItem(itemData)
    
    if (error) {
      logError(error, 'api_inventory_create', user.id)
      return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
    }

    logUserAction('inventory_item_created', { item_name: body.name }, user.id)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logError(error as Error, 'api_inventory_create')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const { data, error } = await updateInventoryItem(id, updates)
    
    if (error) {
      logError(error, 'api_inventory_update', user.id)
      return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
    }

    logUserAction('inventory_item_updated', { item_id: id }, user.id)
    return NextResponse.json({ data })
  } catch (error) {
    logError(error as Error, 'api_inventory_update')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const { error } = await deleteInventoryItem(id)
    
    if (error) {
      logError(error, 'api_inventory_delete', user.id)
      return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
    }

    logUserAction('inventory_item_deleted', { item_id: id }, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    logError(error as Error, 'api_inventory_delete')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}