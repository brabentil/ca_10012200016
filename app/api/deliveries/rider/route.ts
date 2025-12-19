import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';

// Helper to verify auth token from request
async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    return { valid: false, payload: null };
  }
  
  try {
    const payload = verifyAccessToken(token);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

/**
 * GET /api/deliveries/rider
 * Get rider's assigned deliveries
 * Auth: Required (role: RIDER)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;
    const userRole = authResult.payload.role;

    // Verify user is a rider
    if (userRole !== 'RIDER') {
      return errorResponse('Access denied. Rider role required', 'FORBIDDEN', 403);
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Find rider by userId
    const rider = await prisma.campusRider.findUnique({
      where: { userId },
    });

    if (!rider) {
      return errorResponse('Rider profile not found', 'RIDER_NOT_FOUND', 404);
    }

    // Build where clause
    const whereClause: any = {
      riderId: rider.id,
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    // Fetch deliveries
    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const deliveriesResponse = deliveries.map((delivery) => ({
      id: delivery.id,
      orderId: delivery.orderId,
      orderNumber: delivery.order.orderNumber,
      status: delivery.status,
      deliveryAddress: delivery.deliveryAddress,
      customer: {
        name: `${delivery.order.user.firstName} ${delivery.order.user.lastName}`,
        email: delivery.order.user.email,
        phone: delivery.order.user.phone,
      },
      orderTotal: delivery.order.totalAmount,
      orderStatus: delivery.order.status,
      assignedAt: delivery.assignedAt,
      deliveredAt: delivery.deliveredAt,
    }));

    return successResponse(
      {
        deliveries: deliveriesResponse,
        total: deliveries.length,
      },
      'Deliveries retrieved successfully'
    );
  } catch (error) {
    console.error('Get rider deliveries error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve deliveries',
      'DELIVERY_RETRIEVAL_ERROR',
      500
    );
  }
}
