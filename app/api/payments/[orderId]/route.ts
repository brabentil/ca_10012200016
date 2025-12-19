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
 * GET /api/payments/[orderId]
 * Get payment details for an order
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

    // Fetch payment with order details
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return errorResponse('Payment not found', 'PAYMENT_NOT_FOUND', 404);
    }

    // Verify ownership (users can only see their own payments, admins can see all)
    if (userRole !== 'ADMIN' && payment.order.userId !== userId) {
      return errorResponse('Access denied to this payment', 'FORBIDDEN', 403);
    }

    // Format response
    const paymentResponse = {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      installmentPlan: payment.installmentPlan,
      paidAmount: payment.paidAmount,
      remainingAmount: payment.remainingAmount,
      paydayDate: payment.paydayDate,
      transactionRef: payment.transactionRef,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      order: {
        id: payment.order.id,
        orderNumber: payment.order.orderNumber,
        status: payment.order.status,
        totalAmount: payment.order.totalAmount,
        createdAt: payment.order.createdAt,
      },
      customer: {
        id: payment.order.user.id,
        email: payment.order.user.email,
        name: `${payment.order.user.firstName} ${payment.order.user.lastName}`,
      },
    };

    return successResponse(paymentResponse, 'Payment details retrieved successfully');
  } catch (error) {
    console.error('Get payment details error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to retrieve payment details',
      'PAYMENT_RETRIEVAL_ERROR',
      500
    );
  }
}
