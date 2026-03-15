import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecipes } from '@/lib/services/recipes'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const recipes = await getRecipes(user.id)
    return NextResponse.json(recipes)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}
