import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Check if we have an active session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // 2. Protect Admin Routes
  if (url.pathname.startsWith('/admin')) {
    // If not logged in, redirect to login
    if (!session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Check the user's role in the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // If user is not an admin, redirect to unauthorized page
    if (profile?.role !== 'admin') {
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  // 3. Protect Profile Routes (User must be logged in)
  if (url.pathname.startsWith('/profile') || url.pathname.startsWith('/directory')) {
    if (!session) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// 4. Matcher configuration
// This ensures the middleware runs on all routes EXCEPT static files and images
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};