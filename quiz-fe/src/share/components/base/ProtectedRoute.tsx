import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { useIsAuthenticated } from '@/share/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to protect routes - redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <Spin size="large" fullscreen /> 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login, but save the original path
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return fallback;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
