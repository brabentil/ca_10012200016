import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  internalServerErrorResponse,
  paginatedResponse,
} from '@/lib/response';

/**
 * GET /api/products/search - Advanced search with autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Search query
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { views: 'desc' }, // Prioritize popular products
          { createdAt: 'desc' },
        ],
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return paginatedResponse(products, {
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error('Search products error:', error);
    return internalServerErrorResponse('Failed to search products');
  }
}
