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
 * Calculate estimated delivery time (ETA)
 * Simple heuristic: 30-60 minutes based on status
 */
function calculateETA(delivery: any): string | null {
  if (delivery.status === 'DELIVERED' || delivery.status === 'FAILED') {
    return null; // No ETA for completed deliveries
  }

  const now = new Date();

  if (delivery.status === 'ASSIGNED' && delivery.assignedAt) {
    // Estimate 45-60 minutes from assignment time
    const eta = new Date(delivery.assignedAt.getTime() + 50 * 60 * 1000);
    return eta.toISOString();
  }

  if (delivery.status === 'PICKED_UP' && delivery.assignedAt) {
    // Estimate 35 minutes from assignment
    const eta = new Date(delivery.assignedAt.getTime() + 35 * 60 * 1000);
    return eta.toISOString();
  }

  if (delivery.status === 'IN_TRANSIT') {
    // Estimate 15-20 minutes for in-transit
    const eta = new Date(now.getTime() + 18 * 60 * 1000);
    return eta.toISOString();
  }

  return null;
}

/**
 * GET /api/deliveries/track/[orderId]
 * Track delivery for an order (Customer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;
    const userRole = authResult.payload.role;
    const { orderId } = await params;

    // Fetch delivery with order details
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        rider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            zone: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return errorResponse('Delivery not found for this order', 'DELIVERY_NOT_FOUND', 404);
    }

    // Verify ownership (users can only track their own orders, admins can track all)
    if (userRole !== 'ADMIN' && delivery.order.userId !== userId) {
      return errorResponse('Access denied to this delivery', 'FORBIDDEN', 403);
    }

    // Calculate ETA
    const estimatedArrival = calculateETA(delivery);

    // Format response
    const trackingResponse = {
      id: delivery.id,
      orderId: delivery.orderId,
      orderNumber: delivery.order.orderNumber,
      status: delivery.status,
      deliveryAddress: delivery.deliveryAddress,
      rider: delivery.rider ? {
        id: delivery.rider.id,
        name: `${delivery.rider.user.firstName} ${delivery.rider.user.lastName}`,
        phone: delivery.rider.user.phone,
        zone: {
          code: delivery.rider.zone.code,
          name: delivery.rider.zone.name,
        },
      } : null,
      timeline: {
        assigned: delivery.assignedAt,
        delivered: delivery.deliveredAt,
      },
      estimatedArrival,
      orderTotal: delivery.order.totalAmount,
      orderStatus: delivery.order.status,
    };

    return successResponse(trackingResponse, 'Delivery tracking retrieved successfully');
  } catch (error) {
    console.error('Track delivery error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to track delivery',
      'DELIVERY_TRACKING_ERROR',
      500
    );
  }
}
