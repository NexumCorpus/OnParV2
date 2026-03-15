import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMenuItems, getMenuStats } from '@/lib/services/menu'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [items, stats] = await Promise.all([
      getMenuItems(user.id),
      getMenuStats(user.id),
    ])

    return NextResponse.json({ items, stats })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    )
  }
}
