import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { verifyWebhookSignature, PaystackWebhookEvent } from '@/lib/payment/paystack';
import { sendPaymentConfirmationEmail } from '@/lib/email/sendEmail';

/**
 * POST /api/webhooks/paystack
 * Handle Paystack webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return errorResponse('Missing signature', 'MISSING_SIGNATURE', 400);
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(signature, body);
    if (!isValid) {
      return errorResponse('Invalid signature', 'INVALID_SIGNATURE', 401);
    }

    // Parse event payload
    const event: PaystackWebhookEvent = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event);
        break;

      case 'charge.failed':
        await handleChargeFailed(event);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return successResponse(null, 'Webhook processed successfully');
  } catch (error) {
    console.error('Webhook processing error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      'WEBHOOK_ERROR',
      500
    );
  }
}

/**
 * Handle successful charge event
 */
async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { reference, amount, authorization } = event.data;

  // Convert amount from kobo to GHS
  const amountInGHS = amount / 100;

  // Find payment by reference
  const payment = await prisma.payment.findFirst({
    where: { transactionRef: reference },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!payment) {
    console.error('Payment not found for reference:', reference);
    return;
  }

  // Calculate new paid amount
  const newPaidAmount = Number(payment.paidAmount) + amountInGHS;
  const totalAmount = Number(payment.amount);
  const isFullyPaid = newPaidAmount >= totalAmount;

  // Determine payment status
  let newStatus: 'PARTIAL' | 'COMPLETED' = 'PARTIAL';
  if (isFullyPaid) {
    newStatus = 'COMPLETED';
  }

  // Update payment record
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, totalAmount - newPaidAmount),
      status: newStatus,
      authorizationCode: authorization.authorization_code,
      paystackCustomerCode: event.data.customer?.customer_code,
      updatedAt: new Date(),
    } as any,
  });

  // Update order status if fully paid
  if (isFullyPaid) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    });
  }

  // Send confirmation email
  try {
    await sendPaymentConfirmationEmail(
      payment.order.user.email,
      payment.order.orderNumber,
      amountInGHS,
      isFullyPaid
    );
  } catch (emailError) {
    console.error('Failed to send payment confirmation email:', emailError);
    // Don't throw error - payment was successful even if email fails
  }

  console.log(`Payment updated for order ${payment.order.orderNumber}: ${newStatus}`);
}

/**
 * Handle failed charge event
 */
async function handleChargeFailed(event: PaystackWebhookEvent) {
  const { reference, message } = event.data;

  // Find payment by reference
  const payment = await prisma.payment.findFirst({
    where: { transactionRef: reference },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!payment) {
    console.error('Payment not found for reference:', reference);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      updatedAt: new Date(),
    },
  });

  console.error(
    `Payment failed for order ${payment.order.orderNumber}: ${message || 'Unknown error'}`
  );
}
