import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerCampusRiderSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';

// Helper to verify auth token from request
async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    return { valid: false, payload: null };
  }
  
  try {
    const payload = verifyAccessToken(token);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

/**
 * POST /api/admin/riders
 * Register a campus rider (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userRole = authResult.payload.role;

    // Verify admin role
    if (userRole !== 'ADMIN') {
      return errorResponse('Access denied. Admin role required', 'FORBIDDEN', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerCampusRiderSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Validation failed', errors);
    }

    const { userId, zoneId } = validationResult.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    // Verify zone exists
    const zone = await prisma.campusZone.findUnique({
      where: { id: zoneId },
      include: {
        campus: true,
      },
    });

    if (!zone) {
      return errorResponse('Campus zone not found', 'ZONE_NOT_FOUND', 404);
    }

    // Check if user is already a rider
    const existingRider = await prisma.campusRider.findUnique({
      where: { userId },
    });

    if (existingRider) {
      return errorResponse('User is already registered as a rider', 'RIDER_EXISTS', 400);
    }

    // Create CampusRider record and update User role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create rider
      const rider = await tx.campusRider.create({
        data: {
          userId,
          zoneId,
          isAvailable: true,
          totalDeliveries: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
            },
          },
          zone: {
            include: {
              campus: true,
            },
          },
        },
      });

      // Update user role to RIDER
      await tx.user.update({
        where: { id: userId },
        data: { role: 'RIDER' },
      });

      return rider;
    });

    return successResponse(
      {
        id: result.id,
        userId: result.userId,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          phone: result.user.phone,
          role: 'RIDER',
        },
        zone: {
          id: result.zone.id,
          code: result.zone.code,
          name: result.zone.name,
          campus: {
            id: result.zone.campus.id,
            code: result.zone.campus.code,
            name: result.zone.campus.name,
          },
        },
        isAvailable: result.isAvailable,
        totalDeliveries: result.totalDeliveries,
        createdAt: result.createdAt,
      },
      'Campus rider registered successfully'
    );
  } catch (error) {
    console.error('Register campus rider error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to register campus rider',
      'RIDER_REGISTRATION_ERROR',
      500
    );
  }
}
