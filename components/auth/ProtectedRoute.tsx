'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireVerified = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Redirect to verification if student verification is required but not completed
    if (requireVerified && user.verification?.status !== 'VERIFIED') {
      router.push(`/verify?email=${user.email}`);
      return;
    }
  }, [isAuthenticated, user, requireVerified, router]);

  // Show nothing while checking auth status
  if (!isAuthenticated || !user) {
    return null;
  }

  // Show nothing if verification is required but not completed
  if (requireVerified && user.verification?.status !== 'VERIFIED') {
    return null;
  }

  return <>{children}</>;
}
