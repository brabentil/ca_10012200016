import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  authErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return authErrorResponse('Authentication required');
    }

    // Find latest verification for this user
    const verification = await prisma.studentVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eduEmail: true,
        studentId: true,
        campus: true,
        status: true,
        verifiedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!verification) {
      return successResponse({
        status: null,
        message: 'No verification request found',
      });
    }

    // Check if pending verification has expired
    if (verification.status === 'PENDING' && verification.expiresAt && new Date() > verification.expiresAt) {
      return successResponse({
        ...verification,
        isExpired: true,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    return successResponse({
      ...verification,
      isExpired: false,
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return internalServerErrorResponse('Failed to fetch verification status');
  }
}
