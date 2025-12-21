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

  // Debug logging
  console.log('[Middleware] Path:', pathname);
  console.log('[Middleware] Token exists:', !!token);
  if (token) {
    console.log('[Middleware] Token preview:', token.substring(0, 50) + '...');
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
