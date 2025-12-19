import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateCartItemSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse,
  forbiddenErrorResponse,
} from '@/lib/response';

/**
 * PATCH /api/cart/items/[id]
 * Update cart item quantity
 * Auth: Required (set by middleware)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id: cartItemId } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse('Invalid input data', validation.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })));
    }

    const { quantity } = validation.data;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      return notFoundErrorResponse('Cart item not found');
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      return forbiddenErrorResponse('You do not have access to this cart item');
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return conflictErrorResponse(
        `Insufficient stock. Only ${cartItem.product.stock} item(s) available`
      );
    }

    // Update cart item quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
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
    });

    // Format response
    const cartItemResponse = {
      id: updatedCartItem.id,
      productId: updatedCartItem.productId,
      quantity: updatedCartItem.quantity,
      product: {
        id: updatedCartItem.product.id,
        title: updatedCartItem.product.title,
        price: updatedCartItem.product.price,
        stock: updatedCartItem.product.stock,
        size: updatedCartItem.product.size,
        color: updatedCartItem.product.color,
        condition: updatedCartItem.product.condition,
        image: updatedCartItem.product.images[0]?.imageUrl || null,
      },
      itemTotal: Number(updatedCartItem.product.price) * updatedCartItem.quantity,
      updatedAt: updatedCartItem.updatedAt,
    };

    return successResponse(cartItemResponse, 'Cart item updated successfully');
  } catch (error) {
    console.error('Update cart item error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update cart item', 500);
  }
}

/**
 * DELETE /api/cart/items/[id]
 * Remove item from cart
 * Auth: Required (set by middleware)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id: cartItemId } = params;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return notFoundErrorResponse('Cart item');
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      return forbiddenErrorResponse('Access denied to this cart item');
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return successResponse(
      { message: 'Item removed from cart' },
      'Cart item deleted successfully'
    );
  } catch (error) {
    console.error('Delete cart item error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to remove item from cart', 500);
  }
}
