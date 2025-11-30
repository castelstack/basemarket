// api/admin.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  User,
  Transaction,
  DashboardStats,
  AdminUserParams,
  AdminTransactionParams,
  ApiResponse,
} from '../types/api';

// Admin Dashboard API functions
export const adminDashboardApi = {
  getStats: () => 
    apiClient.get<{
      polls: {
        total: number;
        active: number;
        closed?: number;
        resolved?: number;
        cancelled?: number;
        totalPoolAmount: number;
      };
      users: {
        total: number;
        activeToday: number;
        active?: number;
        suspended?: number;
        verified?: number;
        growth?: {
          daily: number;
          weekly: number;
          monthly: number;
        };
      };
      revenue: {
        total: number;
        monthly?: number;
        daily?: number;
        pendingWithdrawals: number;
      };
      totalStakes?: number;
    }>('/api/v1/admin/dashboard/stats'),
  
  getRevenueStats: (startDate: string, endDate: string) => 
    apiClient.get<{
      totalRevenue: number;
      dailyRevenue: Array<{
        date: string;
        revenue: number;
      }>;
    }>(`/api/v1/admin/dashboard/revenue-stats?startDate=${startDate}&endDate=${endDate}`),
  
  getUserStats: (startDate: string, endDate: string) => 
    apiClient.get<{
      totalUsers: number;
      newUsers: number;
      dailyUsers: Array<{
        date: string;
        newUsers: number;
        totalUsers: number;
      }>;
    }>(`/api/v1/admin/dashboard/user-stats?startDate=${startDate}&endDate=${endDate}`),
};

// Admin Users API functions
export const adminUsersApi = {
  getUsers: (params?: AdminUserParams) => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiClient.get<{ 
      docs: User[]; 
      totalDocs: number; 
      page: number; 
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
      pagingCounter: number;
    }>(`/api/v1/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserById: (id: string) => 
    apiClient.get<User>(`/api/v1/admin/users/${id}`),
  
  updateUserStatus: (id: string, status: string) => 
    apiClient.put(`/api/v1/admin/users/${id}/status`, { status }),
  
  updateUserRole: (id: string, role: string) => 
    apiClient.put(`/api/v1/admin/users/${id}/role`, { role }),
  
  lockUserWallet: (id: string) => 
    apiClient.post(`/api/v1/admin/users/${id}/wallet/lock`),
  
  unlockUserWallet: (id: string) => 
    apiClient.post(`/api/v1/admin/users/${id}/wallet/unlock`),
};

// Admin Transactions API functions
export const adminTransactionsApi = {
  getTransactions: (params?: AdminTransactionParams) => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiClient.get<{ 
      docs: Transaction[]; 
      totalDocs: number; 
      page: number; 
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
      pagingCounter: number;
    }>(`/api/v1/admin/transactions${queryString ? `?${queryString}` : ''}`);
  },
  
  getPendingWithdrawals: () => 
    apiClient.get<Transaction[]>('/api/v1/admin/transactions/withdrawals/pending'),
  
  approveWithdrawal: (id: string) => 
    apiClient.put(`/api/v1/admin/transactions/${id}/approve`),
  
  rejectWithdrawal: (id: string) => 
    apiClient.put(`/api/v1/admin/transactions/${id}/reject`),
  
  reconcileTransaction: (transactionId: string) =>
    apiClient.post(`/api/v1/wallet/reconcile/${transactionId}`),
  
  reconcileAllTransactions: () =>
    apiClient.post('/api/v1/wallet/reconcile-all'),
};

// Admin Dashboard hooks
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminDashboardApi.getStats,
  });
};

export const useAdminRevenueStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'revenue-stats', startDate, endDate],
    queryFn: () => adminDashboardApi.getRevenueStats(startDate, endDate),
    enabled: !!(startDate && endDate),
  });
};

export const useAdminUserStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'user-stats', startDate, endDate],
    queryFn: () => adminDashboardApi.getUserStats(startDate, endDate),
    enabled: !!(startDate && endDate),
  });
};

// Admin Users hooks
export const useAdminUsers = (params?: AdminUserParams) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminUsersApi.getUsers(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useAdminUserById = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminUsersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      adminUsersApi.updateUserStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => 
      adminUsersApi.updateUserRole(id, role),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useLockUserWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminUsersApi.lockUserWallet,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useUnlockUserWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminUsersApi.unlockUserWallet,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

// Admin Transactions hooks
export const useAdminTransactions = (params?: AdminTransactionParams) => {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: () => adminTransactionsApi.getTransactions(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useAdminPendingWithdrawals = () => {
  return useQuery({
    queryKey: ['admin', 'transactions', 'pending-withdrawals'],
    queryFn: adminTransactionsApi.getPendingWithdrawals,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminTransactionsApi.approveWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions', 'pending-withdrawals'] });
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminTransactionsApi.rejectWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions', 'pending-withdrawals'] });
    },
  });
};

export const useReconcileTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminTransactionsApi.reconcileTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
};

export const useReconcileAllTransactions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminTransactionsApi.reconcileAllTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    },
  });
};