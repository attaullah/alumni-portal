import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
// Add a safety check at the top of your middleware function
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase Environment Variables");
  return NextResponse.next(); // Let it through so it doesn't 500, or redirect to an error page
}
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ... inside createServerClient
cookies: {
  get(name: string) {
    return request.cookies.get(name)?.value
  },
  set(name: string, value: string, options: CookieOptions) {
    // Explicitly mapping name: name and value: value fixes the "scope" error
    request.cookies.set({ name: name, value: value, ...options })
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    response.cookies.set({ name: name, value: value, ...options })
  },
  remove(name: string, options: CookieOptions) {
    // For removal, the value is typically an empty string
    request.cookies.set({ name: name, value: '', ...options })
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    response.cookies.set({ name: name, value: '', ...options })
  },
},
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/directory/:path*'],
}
