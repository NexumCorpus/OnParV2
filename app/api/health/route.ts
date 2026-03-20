import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    supabase: {
      urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  })
}
