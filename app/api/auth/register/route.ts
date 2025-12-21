import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import {
  successResponse,
  validationErrorResponse,
  conflictErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Register] Received body:', JSON.stringify(body, null, 2));

    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Register] Validation failed:', JSON.stringify(validation.error.issues, null, 2));
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationErrorResponse('Invalid input data', errors);
    }

    console.log('[Register] Validation passed');
    const { email, password, firstName, lastName, phone } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('[Register] Email already exists:', email);
      return conflictErrorResponse('Email already registered');
    }

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    );

    // Set httpOnly cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('[Register] User created successfully:', user.email);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return internalServerErrorResponse('Failed to register user');
  }
}
