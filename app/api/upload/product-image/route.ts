import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3, validateFileType, validateFileSize } from '@/lib/aws/s3';
import {
  successResponse,
  validationErrorResponse,
  forbiddenErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

/**
 * POST /api/upload/product-image - Upload product image to S3
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) {
      return validationErrorResponse('File is required', [
        { field: 'file', message: 'File is required' },
      ]);
    }

    if (!productId) {
      return validationErrorResponse('Product ID is required', [
        { field: 'productId', message: 'Product ID is required' },
      ]);
    }

    // Validate file type
    if (!validateFileType(file.type)) {
      return validationErrorResponse('Invalid file type', [
        {
          field: 'file',
          message: 'Only JPG, PNG, and WebP images are allowed',
        },
      ]);
    }

    // Validate file size (max 5MB)
    if (!validateFileSize(file.size)) {
      return validationErrorResponse('File too large', [
        { field: 'file', message: 'File size must be less than 5MB' },
      ]);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return validationErrorResponse('Product not found', [
        { field: 'productId', message: 'Product not found' },
      ]);
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, file.name, file.type);

    // If this is primary, set all other images to non-primary
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    // Create ProductImage record
    const productImage = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        isPrimary,
      },
    });

    return successResponse(
      {
        id: productImage.id,
        imageUrl: productImage.imageUrl,
        isPrimary: productImage.isPrimary,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return internalServerErrorResponse('Failed to upload image');
  }
}
