import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validation';
import {
  successResponse,
  validationErrorResponse,
  authErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function PATCH(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return authErrorResponse('Authentication required');
    }

    const body = await request.json();

    // Validate request body
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return notFoundErrorResponse('User');
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return internalServerErrorResponse('Failed to update profile');
  }
}
