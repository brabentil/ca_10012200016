import { NextRequest } from 'next/server';
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

    // Note: In a production system, you would:
    // 1. Add the refresh token to a blacklist (Redis or database)
    // 2. Or delete the refresh token from a token store
    // For this implementation, we'll just return success
    // The client should delete the token from storage

    return successResponse(
      { message: 'Logged out successfully' },
      'Logout successful'
    );
  } catch (error) {
    console.error('Logout error:', error);
    return internalServerErrorResponse('Failed to logout');
  }
}
