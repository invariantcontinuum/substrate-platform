/**
 * TanStack Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query';
import { isDevelopment } from '@/config/env';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: !isDevelopment,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
