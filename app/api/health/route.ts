import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Health check that verifies the Supabase backend is actually reachable.
 * A paused or deleted Supabase project fails DNS resolution, which
 * previously went undetected because this endpoint returned a static
 * "healthy" response.
 */
export async function GET() {
  const timestamp = new Date().toISOString()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let database: 'connected' | 'unreachable' | 'not_configured' = 'not_configured'

  if (url && anonKey) {
    try {
      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      // Cheap connectivity probe: RLS returns zero rows for anon,
      // but a response at all proves the backend is up.
      const { error } = await supabase
        .from('users')
        .select('id', { head: true, count: 'exact' })
        .limit(1)
        .abortSignal(AbortSignal.timeout(5000))
      database = error ? 'unreachable' : 'connected'
    } catch {
      database = 'unreachable'
    }
  }

  const healthy = database === 'connected'

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      database,
      timestamp,
      version: '2.0.0',
    },
    { status: healthy ? 200 : 503 }
  )
}
