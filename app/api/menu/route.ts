import { NextRequest, NextResponse } from 'next/server'
import { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } from '@/lib/menu'
import { getCurrentUser } from '@/lib/auth'
import { logError, logUserAction } from '@/lib/error-logging'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await getMenuItems(user.id)
    
    if (error) {
      logError(error, 'api_menu_get', user.id)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }

    logUserAction('menu_fetched', { count: data?.length || 0 }, user.id)
    return NextResponse.json({ data })
  } catch (error) {
    logError(error as Error, 'api_menu_get')
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

    const { data, error } = await createMenuItem(itemData)
    
    if (error) {
      logError(error, 'api_menu_create', user.id)
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    logUserAction('menu_item_created', { item_name: body.name }, user.id)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logError(error as Error, 'api_menu_create')
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

    const { data, error } = await updateMenuItem(id, updates)
    
    if (error) {
      logError(error, 'api_menu_update', user.id)
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
    }

    logUserAction('menu_item_updated', { item_id: id }, user.id)
    return NextResponse.json({ data })
  } catch (error) {
    logError(error as Error, 'api_menu_update')
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

    const { error } = await deleteMenuItem(id)
    
    if (error) {
      logError(error, 'api_menu_delete', user.id)
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
    }

    logUserAction('menu_item_deleted', { item_id: id }, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    logError(error as Error, 'api_menu_delete')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}