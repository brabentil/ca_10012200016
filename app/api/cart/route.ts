import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundErrorResponse } from '@/lib/response';

// Ensure this route works with Edge Runtime
export const runtime = 'nodejs';

/**
 * GET /api/cart
 * Get user's shopping cart with all items and product details
 * Auth: Required (set by middleware)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
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
      },
    });

    // If no cart exists, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
        },
      });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((total: number, item: any) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Format response - map to CartItem interface format
    const cartResponse = {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item: any) => ({
        cart_item_id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        product_name: item.product.title,
        price: Number(item.product.price),
        image_url: item.product.images[0]?.imageUrl || null,
        condition: item.product.condition,
      })),
      subtotal,
      itemCount: cart.items.length,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    return successResponse(cartResponse, 'Cart retrieved successfully');
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to retrieve cart', 500);
  }
}

/**
 * DELETE /api/cart
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

    if (!cart) {
      return notFoundErrorResponse('Cart');
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
