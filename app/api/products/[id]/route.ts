import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProductSchema } from '@/lib/validation';
import {
  successResponse,
  validationErrorResponse,
  forbiddenErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/products/[id] - Get single product details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!product) {
      return notFoundErrorResponse('Product');
    }

    if (!product.isActive) {
      return notFoundErrorResponse('Product');
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    // Increment views counter
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const { reviews, ...productData } = product;

    return successResponse({
      ...productData,
      reviewCount: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return internalServerErrorResponse('Failed to fetch product');
  }
}

/**
 * PATCH /api/products/[id] - Update product (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundErrorResponse('Product');
    }

    const body = await request.json();

    // Validate request body (partial update)
    const validation = createProductSchema.partial().safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validation.data,
      include: {
        images: true,
      },
    });

    return successResponse(updatedProduct, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    return internalServerErrorResponse('Failed to update product');
  }
}

/**
 * DELETE /api/products/[id] - Soft delete product (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundErrorResponse('Product');
    }

    // Soft delete (set isActive to false)
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse(
      { message: 'Product deleted successfully' },
      'Product deleted successfully'
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return internalServerErrorResponse('Failed to delete product');
  }
}
