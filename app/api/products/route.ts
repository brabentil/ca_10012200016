import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProductSchema } from '@/lib/validation';
import {
  successResponse,
  validationErrorResponse,
  forbiddenErrorResponse,
  internalServerErrorResponse,
  paginatedResponse,
} from '@/lib/response';

/**
 * GET /api/products - List products with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      // Convert category to uppercase to match ProductCategory enum
      where.category = category.toUpperCase().replace(/\s+/g, '_');
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size) {
      where.size = size;
    }

    if (color) {
      where.color = {
        contains: color,
        mode: 'insensitive',
      };
    }

    if (condition) {
      // Convert condition to match ProductCondition enum format
      where.condition = condition.toUpperCase().replace(/\s+/g, '_');
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
    console.error('List products error:', error);
    return internalServerErrorResponse('Failed to fetch products');
  }
}

/**
 * POST /api/products - Create product (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user role from middleware-injected header
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const body = await request.json();

    // Validate request body
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    const data = validation.data;

    // Create product
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        size: data.size,
        color: data.color,
        brand: data.brand,
        condition: data.condition,
        price: data.price,
        stock: data.stock,
        isActive: true,
      },
      include: {
        images: true,
      },
    });

    return successResponse(product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return internalServerErrorResponse('Failed to create product');
  }
}
