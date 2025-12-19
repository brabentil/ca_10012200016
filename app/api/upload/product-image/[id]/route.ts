import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromS3 } from '@/lib/aws/s3';
import {
  successResponse,
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
 * DELETE /api/upload/product-image/[id] - Delete product image
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const { id } = params;

    // Find image
    const productImage = await prisma.productImage.findUnique({
      where: { id },
    });

    if (!productImage) {
      return notFoundErrorResponse('Product image');
    }

    // Delete from S3
    try {
      await deleteFromS3(productImage.imageUrl);
    } catch (s3Error) {
      console.error('S3 delete error:', s3Error);
      // Continue even if S3 deletion fails
    }

    // Delete ProductImage record
    await prisma.productImage.delete({
      where: { id },
    });

    return successResponse(
      { message: 'Image deleted successfully' },
      'Image deleted successfully'
    );
  } catch (error) {
    console.error('Delete image error:', error);
    return internalServerErrorResponse('Failed to delete image');
  }
}
