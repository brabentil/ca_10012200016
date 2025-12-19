import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  authErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return authErrorResponse('Authentication required');
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return notFoundErrorResponse('User');
    }

    // Fetch student verification status if exists
    const verification = await prisma.studentVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
        eduEmail: true,
        campus: true,
        verifiedAt: true,
      },
    });

    return successResponse({
      ...user,
      verification: verification || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return internalServerErrorResponse('Failed to fetch user profile');
  }
}
