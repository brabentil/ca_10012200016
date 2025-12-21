import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateDeliveryStatusSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';

// Helper to verify auth token from request
async function verifyAuthToken(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  
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
 * PATCH /api/deliveries/[id]/status
 * Update delivery status (Rider only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;
    const userRole = authResult.payload.role;
    const { id: deliveryId } = await params;

    // Verify user is a rider
    if (userRole !== 'RIDER') {
      return errorResponse('Access denied. Rider role required', 'FORBIDDEN', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateDeliveryStatusSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Validation failed', errors);
    }

    const { status } = validationResult.data;

    // Find rider by userId
    const rider = await prisma.campusRider.findUnique({
      where: { userId },
    });

    if (!rider) {
      return errorResponse('Rider profile not found', 'RIDER_NOT_FOUND', 404);
    }

    // Fetch delivery with ownership verification
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (!delivery) {
      return errorResponse('Delivery not found', 'DELIVERY_NOT_FOUND', 404);
    }

    // Verify ownership (delivery must belong to this rider)
    if (delivery.riderId !== rider.id) {
      return errorResponse('Access denied to this delivery', 'FORBIDDEN', 403);
    }

    // Prepare update data with timestamps
    const updateData: any = { status };

    // Only set deliveredAt timestamp for DELIVERED status
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        rider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update order status based on delivery status
    if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' },
      });
    } else if (status === 'FAILED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'CANCELLED' },
      });
    }

    return successResponse(
      {
        id: updatedDelivery.id,
        orderId: updatedDelivery.orderId,
        orderNumber: updatedDelivery.order.orderNumber,
        status: updatedDelivery.status,
        deliveryAddress: updatedDelivery.deliveryAddress,
        rider: updatedDelivery.rider ? {
          id: updatedDelivery.rider.id,
          name: `${updatedDelivery.rider.user.firstName} ${updatedDelivery.rider.user.lastName}`,
        } : null,
        assignedAt: updatedDelivery.assignedAt,
        deliveredAt: updatedDelivery.deliveredAt,
        updatedAt: updatedDelivery.updatedAt,
      },
      'Delivery status updated successfully'
    );
  } catch (error) {
    console.error('Update delivery status error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update delivery status',
      'DELIVERY_UPDATE_ERROR',
      500
    );
  }
}
