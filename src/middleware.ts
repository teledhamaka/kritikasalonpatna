// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if user is authenticated
  const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
    headers: {
      Cookie: request.headers.get('cookie') || '',
    },
  });
  
  const sessionData = await sessionResponse.json();
  
  // Protected routes
  const protectedPaths = ['/profile', '/book', '/appointments', '/favorites'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // Auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.includes(request.nextUrl.pathname);
  
  // Redirect logic
  if (isProtectedPath && !sessionData.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthPath && sessionData.isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/book/:path*',
    '/appointments/:path*',
    '/favorites/:path*',
    '/login',
    '/signup',
  ],
};