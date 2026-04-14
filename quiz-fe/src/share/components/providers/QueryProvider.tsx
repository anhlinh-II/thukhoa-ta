"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Provider as ZenstackHooksProvider } from '@/share/hooks/zenstack';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200';
  const zenstackEndpoint =
    process.env.NEXT_PUBLIC_ZENSTACK_API_URL ||
    `${apiBase.replace(/\/api\/v1\/?$/, '')}/api/model`;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay increases exponentially
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Don't refetch on reconnect unnecessarily
            refetchOnReconnect: 'always',
            // Background refetch interval (optional)
            refetchInterval: false,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
            // Show error notifications
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ZenstackHooksProvider value={{ endpoint: zenstackEndpoint }}>
        {children}
      </ZenstackHooksProvider>
      {/* Show DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          // position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
