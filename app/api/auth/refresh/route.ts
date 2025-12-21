import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';
import {
  successResponse,
  authErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies instead of body
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return authErrorResponse('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    // Create response with success message
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        data: {},
      },
      { status: 200 }
    );

    // Set new access token as httpOnly cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return authErrorResponse('Invalid or expired refresh token');
  }
}
