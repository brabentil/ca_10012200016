import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addToCartSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse,
} from '@/lib/response';

/**
 * POST /api/cart/items
 * Add item to user's shopping cart
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
    const validation = addToCartSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse('Invalid input data', validation.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })));
    }

    const { productId, quantity } = validation.data;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return notFoundErrorResponse('Product');
    }

    // Check stock availability
    if (product.stock < quantity) {
      return conflictErrorResponse(
        `Insufficient stock. Only ${product.stock} item(s) available`
      );
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item quantity
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        return conflictErrorResponse(
          `Cannot add ${quantity} more item(s). Maximum available: ${
            product.stock - existingCartItem.quantity
          }`
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
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
    }

    // Get updated cart with all items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

    // Calculate subtotal
    const subtotal = updatedCart!.items.reduce((total: number, item: any) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Format response
    const cartResponse = {
      id: updatedCart!.id,
      userId: updatedCart!.userId,
      items: updatedCart!.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          stock: item.product.stock,
          size: item.product.size,
          color: item.product.color,
          condition: item.product.condition,
          image: item.product.images[0]?.url || null,
        },
        itemTotal: item.product.price * item.quantity,
      })),
      subtotal,
      itemCount: updatedCart!.items.length,
    };

    return successResponse(
      cartResponse,
      existingCartItem ? 'Cart item quantity updated' : 'Item added to cart',
      201
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to add item to cart', 500);
  }
}
