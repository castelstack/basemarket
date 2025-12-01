// api/user.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  User,
  UpdateProfileRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  PaginationParams,
} from '../types/api';

// User API functions
export const userApi = {
  getProfile: () => 
    apiClient.get<User>('/api/v1/user'),
  
  getStatistics: () =>
    apiClient.get<{
      totalStaked: number;
      totalWon: number;
      winRate: number;
      completedStakes: number;
      activeStakes?: number;
      lostStakes?: number;
      refundedStakes?: number;
      averageStake?: number;
      largestWin?: number;
      largestStake?: number;
      netProfit?: number;
      winStreak?: number;
      bestStreak?: number;
      favoriteCategory?: string;
      lastActive?: string;
    }>('/api/v1/user/me/statistics'),
  
  signout: () => 
    apiClient.get('/api/v1/user/signout'),
  
  updateProfile: (data: UpdateProfileRequest) => 
    apiClient.patch<User>('/api/v1/user/update', data),
  
  updateEmail: (data: UpdateEmailRequest) => 
    apiClient.patch<User>('/api/v1/user/update/email', data),
  
  updatePassword: (data: UpdatePasswordRequest) => 
    apiClient.patch<User>('/api/v1/user/update/password', data),
  
  enable2FA: () => 
    apiClient.patch<User>('/api/v1/user/2fa/enable'),
  
  disable2FA: () => 
    apiClient.patch<User>('/api/v1/user/2fa/disable'),
};

// Public user API functions
export const publicUserApi = {
  getAllUsers: (params: PaginationParams & { firstName?: string; lastName?: string }) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return apiClient.get<{ users: User[]; total: number; page: number; limit: number }>(
      `/api/v1/public/users/all${queryString ? `?${queryString}` : ''}`
    );
  },
  
  getUserById: (id: string) => 
    apiClient.get<User>(`/api/v1/public/users/${id}`),
};

// User hooks
export const useUserProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userApi.getProfile,
    enabled
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: ['user', 'statistics'],
    queryFn: userApi.getStatistics,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useSignout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.signout,
    onSuccess: () => {
      apiClient.setToken(null);
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: userApi.updatePassword,
  });
};

export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.enable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

// Public user hooks
export const useAllUsers = (params: PaginationParams & { firstName?: string; lastName?: string }) => {
  return useQuery({
    queryKey: ['users', 'all', params],
    queryFn: () => publicUserApi.getAllUsers(params),
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => publicUserApi.getUserById(id),
    enabled: !!id,
  });
};