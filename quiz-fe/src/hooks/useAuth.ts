import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, LoginRequest, LoginResponse, UserGetAccount } from '@/services/authService';

const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  account: () => [...AUTH_QUERY_KEYS.all, 'account'] as const,
  login: () => [...AUTH_QUERY_KEYS.all, 'login'] as const,
};

/**
 * Hook to get current user account info
 */
export const useAccount = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.account(),
    queryFn: async () => {
      const response = await authService.getAccount();
      if (response.code === 1000) {
        return response.result;
      }
      throw new Error(response.message || 'Failed to get account');
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to login user
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);
      if (response.code === 1000 && response.result) {
        // Store token
        localStorage.setItem('access_token', response.result.access_token);
        if (response.result.refresh_token) {
          localStorage.setItem('refresh_token', response.result.refresh_token);
        }
        return response.result;
      }
      throw new Error(response.message || 'Login failed');
    },
    onSuccess: (data) => {
      // Invalidate account query to refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.account() });
      
      // Store user in cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.account(), data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

/**
 * Hook to logout user
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authService.logout();
      
      // Clear storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      return response;
    },
    onSuccess: () => {
      // Clear all auth queries
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      
      // Redirect to login
      router.push('/auth/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still redirect to login even if logout API fails
      router.push('/auth/login');
    },
  });
};

/**
 * Hook to refresh token
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authService.refreshToken();
      if (response.code === 1000 && response.result) {
        // Update token
        localStorage.setItem('access_token', response.result.access_token);
        if (response.result.refresh_token) {
          localStorage.setItem('refresh_token', response.result.refresh_token);
        }
        return response.result;
      }
      throw new Error(response.message || 'Refresh failed');
    },
    onSuccess: (data) => {
      // Invalidate account query to refetch with new token
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.account() });
    },
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: account, isLoading, error } = useAccount();
  
  return {
    isAuthenticated: !!account && !error,
    user: account,
    isLoading,
    error,
  };
};
