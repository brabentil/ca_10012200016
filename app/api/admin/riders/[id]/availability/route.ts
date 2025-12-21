import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateRiderAvailabilitySchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { verifyAccessToken } from '@/lib/auth';

// Helper to verify auth token from request
async function verifyAuthToken(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  
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
 * PATCH /api/admin/riders/[id]/availability
 * Update rider availability (Rider or Admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.valid || !authResult.payload) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const userId = authResult.payload.userId;
    const userRole = authResult.payload.role;
    const { id: riderId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateRiderAvailabilitySchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Validation failed', errors);
    }

    const { isAvailable } = validationResult.data;

    // Fetch rider
    const rider = await prisma.campusRider.findUnique({
      where: { id: riderId },
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
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!rider) {
      return errorResponse('Rider not found', 'RIDER_NOT_FOUND', 404);
    }

    // Verify authorization: admin can update any rider, rider can only update themselves
    if (userRole !== 'ADMIN' && rider.userId !== userId) {
      return errorResponse('Access denied to update this rider', 'FORBIDDEN', 403);
    }

    // Update availability
    const updatedRider = await prisma.campusRider.update({
      where: { id: riderId },
      data: { isAvailable },
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
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return successResponse(
      {
        id: updatedRider.id,
        userId: updatedRider.userId,
        user: {
          id: updatedRider.user.id,
          email: updatedRider.user.email,
          name: `${updatedRider.user.firstName} ${updatedRider.user.lastName}`,
          phone: updatedRider.user.phone,
          role: updatedRider.user.role,
        },
        zone: {
          id: updatedRider.zone.id,
          code: updatedRider.zone.code,
          name: updatedRider.zone.name,
        },
        isAvailable: updatedRider.isAvailable,
        totalDeliveries: updatedRider.totalDeliveries,
        updatedAt: updatedRider.updatedAt,
      },
      'Rider availability updated successfully'
    );
  } catch (error) {
    console.error('Update rider availability error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update rider availability',
      'RIDER_UPDATE_ERROR',
      500
    );
  }
}
