import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

console.log('[Auth Config] JWT_SECRET length:', JWT_SECRET.length);
console.log('[Auth Config] JWT_SECRET preview:', JWT_SECRET.substring(0, 20) + '...');
console.log('[Auth Config] Has quotes?', JWT_SECRET.startsWith('"') || JWT_SECRET.startsWith("'"));

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Sign access token (expires in 15 minutes)
 */
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });
}

/**
 * Sign refresh token (expires in 7 days)
 */
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    console.log('[verifyAccessToken] Verifying with secret length:', JWT_SECRET.length);
    const result = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('[verifyAccessToken] Verification successful');
    return result;
  } catch (error: any) {
    console.log('[verifyAccessToken] Verification failed:', error.message);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification (use for debugging only)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}
