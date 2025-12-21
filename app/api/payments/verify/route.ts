import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';
import { verifyTransaction } from '@/lib/payment/paystack';

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
 * GET /api/payments/verify
 * Verify payment status from Paystack callback
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;

    // Get payment reference from query params
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return errorResponse('Payment reference is required', 'MISSING_REFERENCE', 400);
    }

    // Verify transaction with Paystack
    const verificationResult = await verifyTransaction(reference);

    if (!verificationResult.status) {
      return errorResponse(
        'Payment verification failed',
        'VERIFICATION_FAILED',
        400
      );
    }

    const transactionData = verificationResult.data;

    // Check if payment was successful
    if (transactionData.status !== 'success') {
      return errorResponse(
        `Payment ${transactionData.status}`,
        'PAYMENT_NOT_SUCCESSFUL',
        400
      );
    }

    // Find payment record by transaction reference
    const payment = await prisma.payment.findFirst({
      where: {
        transactionRef: reference,
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return errorResponse('Payment record not found', 'PAYMENT_NOT_FOUND', 404);
    }

    // Verify payment belongs to authenticated user
    if (payment.order.userId !== userId) {
      return errorResponse('Access denied to this payment', 'FORBIDDEN', 403);
    }

    // Check if payment already processed
    if (payment.status === 'COMPLETED') {
      return successResponse(
        {
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
          },
          order: {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            status: payment.order.status,
          },
        },
        'Payment already verified'
      );
    }

    // Update payment and order status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAmount: payment.amount,
        remainingAmount: 0,
      },
    });

    // Update order status to PROCESSING (payment confirmed, ready for fulfillment)
    const updatedOrder = await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PROCESSING',
      },
    });

    return successResponse(
      {
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          paidAmount: updatedPayment.paidAmount,
        },
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: 'PROCESSING',
        },
      },
      'Payment verified successfully'
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to verify payment',
      'VERIFICATION_ERROR',
      500
    );
  }
}
