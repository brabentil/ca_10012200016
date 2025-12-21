import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';
import { initializeTransaction } from '@/lib/payment/paystack';

// Schema for mobile money initialization
const initializeMobileMoneySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

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
 * POST /api/payments/mobile-money/initialize
 * Initialize mobile money payment for an order
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = initializeMobileMoneySchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Validation failed', errors);
    }

    const { orderId } = validationResult.data;

    // Fetch order with user verification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!order) {
      return errorResponse('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    // Verify order ownership
    if (order.userId !== userId) {
      return errorResponse('Access denied to this order', 'FORBIDDEN', 403);
    }

    // Check if order already has a payment
    if (order.payment) {
      return errorResponse('Payment already exists for this order', 'PAYMENT_EXISTS', 400);
    }

    // Calculate payment amount
    const totalAmount = Number(order.totalAmount);

    // Generate unique payment reference
    const paymentReference = `THB-MM-${Date.now()}-${orderId.substring(0, 8)}`;

    // Initialize Paystack transaction for mobile money
    const paystackResponse = await initializeTransaction(
      order.user.email,
      totalAmount,
      paymentReference,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentType: 'MOBILE_MONEY',
        userId: order.userId,
      },
      ['mobile_money'] // Specify mobile money as payment channel
    );

    if (!paystackResponse.status) {
      return errorResponse(
        'Failed to initialize payment',
        'PAYMENT_INITIALIZATION_FAILED',
        500
      );
    }

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: 'MOBILE_MONEY',
        status: 'PENDING',
        installmentPlan: false,
        paidAmount: 0,
        remainingAmount: 0,
        transactionRef: paymentReference,
      },
    });

    // Return payment URL
    return successResponse(
      {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        payment: {
          id: payment.id,
          amount: payment.amount,
        },
      },
      'Payment initialized successfully'
    );
  } catch (error) {
    console.error('Initialize Mobile Money error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to initialize payment',
      'PAYMENT_INITIALIZATION_ERROR',
      500
    );
  }
}
