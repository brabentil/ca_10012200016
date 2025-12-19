import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  notFoundErrorResponse,
  forbiddenErrorResponse,
} from '@/lib/response';

/**
 * GET /api/orders/[id]
 * Get complete order details with items, payment, and delivery
 * Auth: Required (set by middleware)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id: orderId } = await params;

    // Fetch order with all relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        payment: true,
        delivery: {
          include: {
            rider: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return notFoundErrorResponse('Order');
    }

    // Verify ownership (users can only see their own orders, admins can see all)
    if (order.userId !== userId && userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Access denied to this order');
    }

    // Format response
    const orderResponse = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryAddress: (order as any).deliveryAddress,
      campusZone: (order as any).campusZone,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        itemTotal: Number(item.priceAtPurchase) * item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          size: item.product.size,
          color: item.product.color,
          condition: item.product.condition,
          image: item.product.images[0]?.imageUrl || null,
        },
      })),
      payment: order.payment
        ? {
            id: order.payment.id,
            paymentMethod: order.payment.method,
            paymentStatus: order.payment.status,
            amount: order.payment.amount,
            installmentPlan: order.payment.installmentPlan,
            paidAmount: order.payment.paidAmount,
            remainingAmount: order.payment.remainingAmount,
            paydayDate: order.payment.paydayDate,
          }
        : null,
      delivery: order.delivery
        ? {
            id: order.delivery.id,
            deliveryStatus: order.delivery.status,
            deliveryAddress: order.delivery.deliveryAddress,
            zoneId: order.delivery.zoneId,
            assignedAt: order.delivery.assignedAt,
            deliveredAt: order.delivery.deliveredAt,
            rider: order.delivery.rider
              ? {
                  name: `${order.delivery.rider.user.firstName} ${order.delivery.rider.user.lastName}`,
                  phone: order.delivery.rider.user.phone,
                  zoneId: order.delivery.rider.zoneId,
                }
              : null,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return successResponse(orderResponse, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order details error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to retrieve order details', 500);
  }
}
