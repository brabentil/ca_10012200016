import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateOrderStatusSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundErrorResponse,
} from '@/lib/response';

/**
 * PATCH /api/admin/orders/[id]/status
 * Update order status (Admin only)
 * Auth: Required (role: ADMIN - enforced by middleware)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }

    const { id: orderId } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        'Invalid input data',
        validation.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    }

    const { status } = validation.data;

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return notFoundErrorResponse('Order');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
        delivery: true,
      },
    });

    // Format response
    const orderResponse = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      deliveryAddress: (updatedOrder as any).deliveryAddress,
      campusZone: (updatedOrder as any).campusZone,
      customer: {
        name: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
        email: updatedOrder.user.email,
      },
      payment: updatedOrder.payment
        ? {
            paymentMethod: updatedOrder.payment.method,
            paymentStatus: updatedOrder.payment.status,
          }
        : null,
      delivery: updatedOrder.delivery
        ? {
            deliveryStatus: updatedOrder.delivery.status,
          }
        : null,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    };

    return successResponse(orderResponse, 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update order status', 500);
  }
}
