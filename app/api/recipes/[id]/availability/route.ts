import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkIngredientAvailability } from '@/lib/services/recipes'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const availability = await checkIngredientAvailability(id)
    return NextResponse.json(availability)
  } catch {
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
