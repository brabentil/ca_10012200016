import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/auth';

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
const adminRoutes = ['/api/admin'];

/**
 * Rider-only routes
 */
const riderRoutes = ['/api/deliveries/rider'];

export function middleware(request: NextRequest) {
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

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
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
    const payload = verifyAccessToken(token);

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
