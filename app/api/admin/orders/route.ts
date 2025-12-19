import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paginatedResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/admin/orders
 * List all orders with filters (Admin only)
 * Auth: Required (role: ADMIN - enforced by middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Fetch orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const ordersResponse = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      campusZone: order.campusZone,
      customer: {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.user.phone,
      },
      itemCount: order.items.length,
      items: order.items.map((item: any) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })),
      payment: order.payment
        ? {
            paymentMethod: order.payment.method,
            paymentStatus: order.payment.status,
            installmentPlan: order.payment.installmentPlan,
            paidAmount: order.payment.paidAmount,
            remainingAmount: order.payment.remainingAmount,
          }
        : null,
      delivery: order.delivery
        ? {
            deliveryStatus: order.delivery.status,
            rider: order.delivery.rider
              ? `${order.delivery.rider.user.firstName} ${order.delivery.rider.user.lastName}`
              : null,
          }
        : null,
      createdAt: order.createdAt,
    }));

    return paginatedResponse(ordersResponse, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to retrieve orders', 500);
  }
}
