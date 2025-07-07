// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const PROTECTED_ROUTES = [
  '/protected'
];

// Define auth-related routes that should redirect if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('my-app-auth');
  
  console.log(`[Middleware] Processing: ${pathname}, Auth cookie present: ${!!authCookie}`);
  
  // Create response object
  const response = NextResponse.next();
  
  // If we have an auth cookie, validate it with the backend
  if (authCookie) {
    try {
      console.log('[Middleware] Validating JWT token with backend...');
      
      // Call our backend to validate the JWT token
      const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/`, {
        method: 'GET',
        headers: {
          'Cookie': `my-app-auth=${authCookie.value}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        // Add timeout and better error handling for middleware context
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (validateResponse.ok) {
        const userData = await validateResponse.json();
        console.log('[Middleware] Token valid, user authenticated:', userData.email);
        
        // Set auth state in response headers for the server components to read
        response.headers.set('X-Auth-User', JSON.stringify(userData));
        response.headers.set('X-Auth-Authenticated', 'true');
        
        // If user is authenticated and trying to access auth pages, redirect to home
        if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
          console.log('[Middleware] Authenticated user accessing auth page, redirecting to home');
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        console.log('[Middleware] Token invalid or expired');
        // Token is invalid - clear it and treat as unauthenticated
        response.cookies.delete('my-app-auth');
        response.cookies.delete('my-app-refresh-token');
        response.headers.set('X-Auth-Authenticated', 'false');
      }
    } catch (error) {
      console.error('[Middleware] Error validating token:', error);
      // On error, treat as unauthenticated but don't clear cookies (might be network issue)
      response.headers.set('X-Auth-Authenticated', 'false');
    }
  } else {
    console.log('[Middleware] No auth cookie found');
    response.headers.set('X-Auth-Authenticated', 'false');
  }
  
  // Check if user is trying to access a protected route without authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthenticated = response.headers.get('X-Auth-Authenticated') === 'true';
  
  if (isProtectedRoute && !isAuthenticated) {
    console.log('[Middleware] Unauthenticated user accessing protected route, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('[Middleware] Request processed successfully');
  return response;
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};