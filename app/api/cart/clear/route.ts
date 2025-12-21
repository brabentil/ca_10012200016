import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundErrorResponse } from '@/lib/response';

export const runtime = 'nodejs';

/**
 * DELETE /api/cart/clear
 * Clear all items from user's cart
 * Auth: Required (set by middleware)
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    // If no cart exists, return success (nothing to clear)
    if (!cart) {
      return successResponse(
        { message: 'Cart is already empty' },
        'No items to remove'
      );
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return successResponse(
      { message: 'Cart cleared successfully' },
      'All items removed from cart'
    );
  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to clear cart', 500);
  }
}
