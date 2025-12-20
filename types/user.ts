export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: 'student' | 'rider' | 'admin';
  profile_picture_url: string | null;
  campus_zone: string | null;
  dorm_name: string | null;
  room_number: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
