import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializePaydayFlexSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';
import { initializeTransaction } from '@/lib/payment/paystack';

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
 * POST /api/payments/payday-flex/initialize
 * Initialize installment payment for an order
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
    const validationResult = initializePaydayFlexSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Validation failed', errors);
    }

    const { orderId, paydayDate } = validationResult.data;

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

    // Calculate payment amounts
    const totalAmount = Number(order.totalAmount);
    const firstPayment = totalAmount * 0.5; // 50%
    const remainingAmount = totalAmount - firstPayment;

    // Generate unique payment reference
    const paymentReference = `THB-PAY-${Date.now()}-${orderId.substring(0, 8)}`;

    // Initialize Paystack transaction for first payment
    const paystackResponse = await initializeTransaction(
      order.user.email,
      firstPayment,
      paymentReference,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentType: 'INSTALLMENT_FIRST',
        userId: order.userId,
      }
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
        method: 'INSTALLMENT',
        status: 'PENDING',
        installmentPlan: true,
        paidAmount: 0,
        remainingAmount: remainingAmount,
        paydayDate: new Date(paydayDate),
        transactionRef: paymentReference,
      },
    });

    // Return payment URL
    return successResponse(
      {
        paymentUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        payment: {
          id: payment.id,
          totalAmount: payment.amount,
          firstPayment: firstPayment,
          remainingAmount: payment.remainingAmount,
          paydayDate: payment.paydayDate,
        },
      },
      'Payment initialized successfully'
    );
  } catch (error) {
    console.error('Initialize Payday Flex error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to initialize payment',
      'PAYMENT_INITIALIZATION_ERROR',
      500
    );
  }
}
