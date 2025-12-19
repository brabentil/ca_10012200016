import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificationCodeSchema } from '@/lib/validation';
import {
  successResponse,
  validationErrorResponse,
  authErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return authErrorResponse('Authentication required');
    }

    const body = await request.json();

    // Validate request body
    const validation = verificationCodeSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    const { verificationCode } = validation.data;

    // Find pending verification for this user
    const verification = await prisma.studentVerification.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return notFoundErrorResponse('Verification request');
    }

    // Check if code matches
    if (verification.verificationCode !== verificationCode) {
      return authErrorResponse('Invalid verification code');
    }

    // Check if code has expired (30 minutes)
    const now = new Date();
    if (verification.expiresAt && now > verification.expiresAt) {
      return authErrorResponse('Verification code has expired');
    }

    // Update verification status
    const updatedVerification = await prisma.studentVerification.update({
      where: { id: verification.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: now,
      },
      select: {
        id: true,
        eduEmail: true,
        studentId: true,
        campus: true,
        status: true,
        verifiedAt: true,
      },
    });

    return successResponse(
      updatedVerification,
      'Student verification successful'
    );
  } catch (error) {
    console.error('Verification error:', error);
    return internalServerErrorResponse('Failed to verify student');
  }
}
