// api/banks.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  Bank,
  VerifyAccountRequest,
  ApiResponse,
} from '../types/api';

// Banks API functions
export const banksApi = {
  getBanks: () => 
    apiClient.get<Bank[]>('/api/v1/banks'),
  
  verifyAccount: (data: VerifyAccountRequest) => 
    apiClient.post<{
      accountName: string;
      accountNumber: string;
      bankName: string;
    }>('/api/v1/banks/verify-account', data),
};

// Public Banks API functions
export const publicBanksApi = {
  getBanks: () => 
    apiClient.get<Bank[]>('/api/v1/public/banks'),
};

// Banks hooks
export const useBanks = () => {
  return useQuery({
    queryKey: ['banks'],
    queryFn: banksApi.getBanks,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
  });
};

export const usePublicBanks = () => {
  return useQuery({
    queryKey: ['banks', 'public'],
    queryFn: publicBanksApi.getBanks,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
  });
};

export const useVerifyAccount = () => {
  return useMutation({
    mutationFn: banksApi.verifyAccount,
  });
};