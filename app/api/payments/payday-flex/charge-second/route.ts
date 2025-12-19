import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { chargeAuthorization } from '@/lib/payment/paystack';
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailureEmail,
} from '@/lib/email/sendEmail';

/**
 * POST /api/payments/payday-flex/charge-second
 * Charge second installment for due payments (Cron job)
 * Auth: Internal API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.INTERNAL_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Get today's date (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find payments due today with PARTIAL status
    const duePayments = await prisma.payment.findMany({
      where: {
        status: 'PARTIAL',
        installmentPlan: true,
        paydayDate: {
          gte: today,
          lt: tomorrow,
        },
        NOT: {
          authorizationCode: null,
        },
      } as any,
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${duePayments.length} payments due today`);

    const results = {
      total: duePayments.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each payment
    for (const payment of duePayments) {
      try {
        const remainingAmount = Number(payment.remainingAmount);
        const authCode = (payment as any).authorizationCode;

        if (!authCode) {
          console.error(`No authorization code for payment ${payment.id}`);
          results.failed++;
          results.errors.push(
            `Payment ${payment.id}: Missing authorization code`
          );
          continue;
        }

        // Generate unique reference for second charge
        const chargeReference = `THB-PAY2-${Date.now()}-${payment.id.substring(0, 8)}`;

        // Charge the authorization
        const chargeResponse = await chargeAuthorization(
          authCode,
          (payment as any).order.user.email,
          remainingAmount,
          chargeReference
        );

        if (
          chargeResponse.status &&
          chargeResponse.data.status === 'success'
        ) {
          // Update payment to COMPLETED
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              paidAmount: Number(payment.amount),
              remainingAmount: 0,
              status: 'COMPLETED',
              transactionRef: chargeReference,
              updatedAt: new Date(),
            },
          });

          // Update order status to CONFIRMED
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CONFIRMED',
              updatedAt: new Date(),
            },
          });

          // Send success email
          try {
            await sendPaymentConfirmationEmail(
              (payment as any).order.user.email,
              (payment as any).order.orderNumber,
              remainingAmount,
              true
            );
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }

          results.successful++;
          console.log(
            `Successfully charged payment ${payment.id} for order ${(payment as any).order.orderNumber}`
          );
        } else {
          // Charge failed
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              updatedAt: new Date(),
            },
          });

          // Send failure email
          try {
            await sendPaymentFailureEmail(
              (payment as any).order.user.email,
              (payment as any).order.orderNumber,
              remainingAmount,
              chargeResponse.message || 'Payment declined'
            );
          } catch (emailError) {
            console.error('Failed to send failure email:', emailError);
          }

          results.failed++;
          results.errors.push(
            `Payment ${payment.id}: ${chargeResponse.message || 'Charge failed'}`
          );
          console.error(
            `Failed to charge payment ${payment.id}: ${chargeResponse.message}`
          );
        }
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Payment ${payment.id}: ${errorMessage}`);
        console.error(`Error processing payment ${payment.id}:`, error);

        // Update payment status to FAILED
        try {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              updatedAt: new Date(),
            },
          });

          // Send failure email
          await sendPaymentFailureEmail(
            (payment as any).order.user.email,
            (payment as any).order.orderNumber,
            Number(payment.remainingAmount),
            errorMessage
          );
        } catch (updateError) {
          console.error(
            `Failed to update payment ${payment.id} status:`,
            updateError
          );
        }
      }
    }

    return successResponse(results, 'Second installment charging completed');
  } catch (error) {
    console.error('Charge second installment error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to charge installments',
      'CHARGE_ERROR',
      500
    );
  }
}
