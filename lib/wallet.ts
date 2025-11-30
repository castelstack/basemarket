// api/wallet.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  Wallet,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  TransactionParams,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

// Wallet API functions
export const walletApi = {
  getWallet: () => apiClient.get<Wallet>('/api/v1/wallet'),

  getBalance: () =>
    apiClient.get<{
      availableBalance: number;
      bonusBalance: number;
      mainBalance: number;
      totalBalance: number;
    }>('/api/v1/wallet/balance'),

  deposit: (data: DepositRequest) =>
    apiClient.post<{
      metadata: {
        paymentLink: string;
      };
    }>('/api/v1/wallet/deposit', data),

  withdraw: (data: WithdrawalRequest) =>
    apiClient.post<{
      withdrawalId: string;
      status: string;
    }>('/api/v1/wallet/withdraw', data),

  calculateWithdrawal: (amount: number) =>
    apiClient.post<{
      requestedAmount: number;
      platformFee: number;
      platformFeePercentage: number;
      transferFee: number;
      totalDebit: number;
      netAmount: number;
      balanceBefore: number;
      balanceAfter: number;
      canWithdraw: boolean;
    }>('/api/v1/wallet/calculate-withdrawal', { amount }),

  getTransactions: (params?: TransactionParams) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    return apiClient.get<PaginatedResponse<Transaction>>(`/api/v1/wallet/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionById: (id: string) =>
    apiClient.get<Transaction>(`/api/v1/wallet/transactions/${id}`),

  verifyPayment: (reference: string) =>
    apiClient.post<Transaction>(`/api/v1/wallet/verify/${reference}`),
};

// Wallet hooks
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });
};

export const useWalletBalance = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletApi.getBalance,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useCalculateWithdrawal = (amount: number | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calculate-withdrawal', amount],
    queryFn: () => walletApi.calculateWithdrawal(amount!),
    enabled: !!amount && amount > 0 && enabled,
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useTransactions = (params?: TransactionParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => walletApi.getTransactions(params),
  });
};

export const useTransactionById = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => walletApi.getTransactionById(id),
    enabled: !!id,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: walletApi.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
