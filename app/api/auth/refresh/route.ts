import { NextRequest } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';
import {
  successResponse,
  authErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

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

    return successResponse(
      {
        accessToken: newAccessToken,
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return authErrorResponse('Invalid or expired refresh token');
  }
}
