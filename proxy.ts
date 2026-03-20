import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/features', '/contact', '/api/health', '/api/webhook']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets early (no Supabase needed)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/webhook')) {
    return NextResponse.next({ request })
  }

  // If Supabase env vars are missing, allow the request through
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  try {
    let supabaseResponse = await updateSession(request)

    // Create Supabase client that shares the response cookies with updateSession
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect logged-in users away from auth pages (check before public route return)
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return supabaseResponse
    }

    // Redirect unauthenticated users to login
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Onboarding redirect — check if authenticated user has completed onboarding
    if (!pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
      const { data: userData } = await supabase
        .from('users').select('settings').eq('id', user.id).maybeSingle()
      if (userData && !(userData.settings as Record<string, unknown>)?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // If user completed onboarding but visits /onboarding, redirect to dashboard
    if (pathname.startsWith('/onboarding')) {
      const { data: userData } = await supabase
        .from('users').select('settings').eq('id', user.id).maybeSingle()
      if ((userData?.settings as Record<string, unknown>)?.onboarding_completed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return supabaseResponse
  } catch {
    // If proxy fails, allow public routes through and redirect others to login
    if (isPublicRoute(pathname)) {
      return NextResponse.next({ request })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|monitoring|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
