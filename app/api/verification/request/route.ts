import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificationRequestSchema } from '@/lib/validation';
import { sendVerificationCodeEmail } from '@/lib/email/sendEmail';
import {
  successResponse,
  validationErrorResponse,
  authErrorResponse,
  conflictErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

/**
 * Generate 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return authErrorResponse('Authentication required');
    }

    const body = await request.json();

    // Validate request body
    const validation = verificationRequestSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    const { eduEmail, studentId, campus } = validation.data;

    // Check if eduEmail is already used
    const existingVerification = await prisma.studentVerification.findFirst({
      where: {
        eduEmail,
        status: { in: ['PENDING', 'VERIFIED'] },
      },
    });

    if (existingVerification) {
      return conflictErrorResponse('Educational email already in use');
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();

    // Calculate expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Create verification request
    const verification = await prisma.studentVerification.create({
      data: {
        userId,
        eduEmail,
        studentId,
        campus,
        verificationCode,
        expiresAt,
        status: 'PENDING',
      },
      select: {
        id: true,
        eduEmail: true,
        studentId: true,
        campus: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Send verification code via email
    try {
      await sendVerificationCodeEmail(eduEmail, verificationCode, expiresAt);
      console.log(`✅ Verification email sent successfully to ${eduEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail the request if email fails - log the code for development
      console.log(`\n⚠️  EMAIL NOT CONFIGURED - Add SMTP settings to .env.local:`);
      console.log(`SMTP_HOST=smtp.gmail.com`);
      console.log(`SMTP_PORT=587`);
      console.log(`SMTP_USER=your-email@gmail.com`);
      console.log(`SMTP_PASSWORD=your-app-password\n`);
      console.log(`📋 Verification code for ${eduEmail}: ${verificationCode}`);
      console.log(`⏰ Expires at: ${expiresAt.toISOString()}\n`);
    }

    return successResponse(
      {
        ...verification,
        message: `Verification code sent to ${eduEmail}`,
        // Include code in response for testing (remove in production)
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      },
      'Verification request created successfully',
      201
    );
  } catch (error) {
    console.error('Verification request error:', error);
    return internalServerErrorResponse('Failed to create verification request');
  }
}
