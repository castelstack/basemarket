// api/health.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Health API functions
export const healthApi = {
  checkHealth: () =>
    apiClient.get<{ status: string; timestamp: string }>('/api/v1'),
};

// Health hooks
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.checkHealth,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });
};
