import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse,
  paginatedResponse,
} from '@/lib/response';
import { format } from 'date-fns';

/**
 * Generate unique order number
 * Format: THB-{YYYYMMDD}-{randomString}
 */
function generateOrderNumber(): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `THB-${dateStr}-${randomStr}`;
}

/**
 * POST /api/orders
 * Create order from cart with transaction
 * Auth: Required (set by middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const body = await request.json();

    // Validate request body
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        'Invalid input data',
        validation.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      );
    }

    const { deliveryAddress, campusZone, paymentMethod } = validation.data;

    // Find user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return conflictErrorResponse('Cart is empty. Add items before creating an order.');
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return conflictErrorResponse(
          `Product "${item.product.title}" is no longer available.`
        );
      }
      if (item.product.stock < item.quantity) {
        return conflictErrorResponse(
          `Insufficient stock for "${item.product.title}". Only ${item.product.stock} available.`
        );
      }
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total: number, item: any) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with transaction (atomic operation)
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          totalAmount,
          deliveryAddress,
          campusZone,
          status: 'PENDING',
        } as any,
      });

      // 2. Create OrderItems with priceAtPurchase snapshot
      const orderItems = await Promise.all(
        cart.items.map((item: any) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            },
          })
        )
      );

      // 3. Reduce product stock atomically
      await Promise.all(
        cart.items.map((item: any) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      // 4. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 5. Create Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: totalAmount,
          method: paymentMethod,
          status: 'PENDING',
          installmentPlan: paymentMethod === 'INSTALLMENT',
          paidAmount: 0,
          remainingAmount: paymentMethod === 'INSTALLMENT' ? totalAmount : 0,
        } as any,
      });

      return newOrder;
    });

    // Fetch complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
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
      },
    });

    // Format response
    const orderResponse = {
      id: completeOrder!.id,
      orderNumber: completeOrder!.orderNumber,
      status: completeOrder!.status,
      totalAmount: completeOrder!.totalAmount,
      deliveryAddress: (completeOrder as any).deliveryAddress,
      campusZone: (completeOrder as any).campusZone,
      items: completeOrder!.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        product: {
          title: item.product.title,
          image: item.product.images[0]?.imageUrl || null,
        },
      })),
      payment: {
        id: completeOrder!.payment!.id,
        paymentMethod: completeOrder!.payment!.method,
        paymentStatus: completeOrder!.payment!.status,
        installmentPlan: completeOrder!.payment!.installmentPlan,
      },
      createdAt: completeOrder!.createdAt,
    };

    return successResponse(orderResponse, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create order', 500);
  }
}

/**
 * GET /api/orders
 * List user's orders with pagination
 * Auth: Required (set by middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Fetch orders with pagination
    const orders = await prisma.order.findMany({
      where,
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
        delivery: true,
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
      itemCount: order.items.length,
      paymentStatus: order.payment?.status || 'PENDING',
      deliveryStatus: order.delivery?.status || null,
      createdAt: order.createdAt,
    }));

    return paginatedResponse(ordersResponse, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to retrieve orders', 500);
  }
}
