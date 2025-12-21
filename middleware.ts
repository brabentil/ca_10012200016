import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/auth-edge';

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/api/auth/me',
  '/api/auth/profile',
  '/api/verification',
  '/api/cart',
  '/api/orders',
  '/api/payments',
  '/api/reviews',
  '/api/wishlist',
  '/api/deliveries/rider',
];

/**
 * Admin-only routes
 */
const adminRoutes = ['/api/admin', '/api/upload'];

/**
 * Rider-only routes
 */
const riderRoutes = ['/api/deliveries/rider'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // Allow GET requests to reviews (reading reviews is public)
  if (pathname.startsWith('/api/reviews') && method === 'GET') {
    return NextResponse.next();
  }

  // Check if this is a product modification (admin only)
  const isProductMutation = pathname.startsWith('/api/products') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route)) || isProductMutation;
  const isRiderRoute = riderRoutes.some((route) => pathname.startsWith(route));

  // Skip authentication for non-protected routes
  if (!isProtectedRoute && !isAdminRoute && !isRiderRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Debug logging
  console.log('[Middleware] Path:', pathname);
  console.log('[Middleware] All cookies:', request.cookies.getAll().map(c => c.name));
  console.log('[Middleware] Token exists:', !!token);
  if (token) {
    console.log('[Middleware] Token preview:', token.substring(0, 50) + '...');
  }

  // If no access token but refresh token exists, try to refresh
  if (!token && refreshToken) {
    console.log('[Middleware] Access token missing, attempting auto-refresh');
    try {
      // Call refresh endpoint internally
      const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        console.log('[Middleware] Token refreshed successfully');
        // Get the new access token from response cookies
        const newAccessToken = refreshResponse.headers.get('set-cookie')?.match(/accessToken=([^;]+)/)?.[1];
        
        if (newAccessToken) {
          // Create response that continues the request
          const response = NextResponse.next();
          
          // Forward the new access token cookie to the client
          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15,
            path: '/',
          });
          
          // Verify the new token and add headers
          const payload = await verifyAccessToken(newAccessToken);
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', payload.userId);
          requestHeaders.set('x-user-email', payload.email);
          requestHeaders.set('x-user-role', payload.role);
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
            headers: response.headers,
          });
        }
      }
    } catch (error) {
      console.log('[Middleware] Auto-refresh failed:', error);
    }
  }

  if (!token) {
    console.log('[Middleware] No token found, returning 401');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    );
  }

  try {
    // Verify token
    console.log('[Middleware] Attempting to verify token...');
    const payload = await verifyAccessToken(token);
    console.log('[Middleware] Token verified successfully, userId:', payload.userId, 'role:', payload.role);

    // Check admin access
    if (isAdminRoute) {
      if (payload.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin access required',
            },
          },
          { status: 403 }
        );
      }
    }

    // Check rider access
    if (isRiderRoute && payload.role !== 'RIDER' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Rider access required',
          },
        },
        { status: 403 }
      );
    }

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('[Middleware] Token verification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Invalid or expired token',
        },
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
