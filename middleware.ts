import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import { logger } from '@/lib/utils/logger'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/features', '/contact', '/api/health', '/api/webhook']

export async function middleware(request: NextRequest) {
  logger.info({ path: request.nextUrl.pathname, method: request.method }, 'request')

  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response
  }

  // Allow static assets and API routes that aren't protected
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/webhook')) {
    return response
  }

  // Check auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Onboarding redirect — check if authenticated user has completed onboarding
  if (user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
    const { data: userData } = await supabase
      .from('users').select('settings').eq('id', user.id).maybeSingle()
    if (userData && !(userData.settings as Record<string, unknown>)?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // If user completed onboarding but visits /onboarding, redirect to dashboard
  if (user && pathname.startsWith('/onboarding')) {
    const { data: userData } = await supabase
      .from('users').select('settings').eq('id', user.id).maybeSingle()
    if ((userData?.settings as Record<string, unknown>)?.onboarding_completed) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
