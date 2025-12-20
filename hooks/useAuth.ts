import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';
import apiClient from '@/lib/api-client';
import { AuthResponse, LoginInput, RegisterInput, User } from '@/types/user';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const { user, setUser, login: storeLogin, logout: storeLogout } = useAuthStore();

  // Login mutation
  const { mutate: login, isPending: isLoggingIn, error: loginError } = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        storeLogin(data.user);
        router.push('/');
      }
    },
  });

  // Register mutation
  const { mutate: register, isPending: isRegistering, error: registerError } = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        storeLogin(data.user);
        router.push('/verify');
      }
    },
  });

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      storeLogout();
      router.push('/login');
    },
  });

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      return response.data.user;
    },
    enabled: !!user,
    initialData: user || undefined,
  });

  return {
    user: currentUser || user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    isLoadingUser,
    loginError,
    registerError,
  };
}
