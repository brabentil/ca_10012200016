export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'STUDENT' | 'RIDER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  verification?: {
    status: string;
    eduEmail: string;
    campus: string;
    verifiedAt: string | null;
  } | null;
}

export interface StudentVerification {
  verification_id: number;
  user_id: number;
  edu_email: string;
  verification_code: string;
  is_verified: boolean;
  created_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}
