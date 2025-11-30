// lib/platform-settings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface PlatformLimits {
  maxStakeAmount: number;
  minStakeAmount: number;
  minWithdrawalAmount: number;
}

export interface CustomSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  maxLoginAttempts?: number;
  sessionTimeout?: number;
}

export interface PlatformSettings {
  platformName?: string;
  supportEmail?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  registrationEnabled?: boolean;
  emailVerificationRequired?: boolean;
  maxDailyWithdrawals?: number;
  minDepositAmount?: number;
  maxDepositAmount?: number;
  defaultCurrency?: string;
  pollDurationHours?: number;
  maxPollsPerUser?: number;
  maxWinnersPerPoll?: number;
  platformFeePercentage?: number;
  withdrawalFeePercentage?: number;
  minStakeAmount?: number;
  maxStakeAmount?: number;
  minWithdrawalAmount?: number;
  stakingEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  pollCreationEnabled?: boolean;
  customSettings?: CustomSettings;
}

export interface PlatformFees {
  platformFeePercentage?: number;
  withdrawalFeeFixed?: number;
  withdrawalFeePercentage?: number;
}

export interface PlatformFeatures {
  stakingEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  depositsEnabled?: boolean;
  notificationsEnabled?: boolean;
}

// Platform Settings API functions
export const platformSettingsApi = {
  getLimits: () => 
    apiClient.get<PlatformLimits>('/api/v1/public/platform-settings/limits'),
  
  getSettings: () =>
    apiClient.get<PlatformSettings>('/api/v1/admin/platform-settings'),
  
  getFees: () =>
    apiClient.get<PlatformFees>('/api/v1/admin/platform-settings/fees'),
  
  getFeatures: () =>
    apiClient.get<PlatformFeatures>('/api/v1/admin/platform-settings/features'),
  
  updateSettings: (data: Partial<PlatformSettings>) =>
    apiClient.put('/api/v1/admin/platform-settings', data),
  
  updateMaintenance: (data: { maintenanceMode: boolean; maintenanceMessage?: string }) =>
    apiClient.put('/api/v1/admin/platform-settings/maintenance', data),
  
  resetDefaults: () =>
    apiClient.post('/api/v1/admin/platform-settings/reset-defaults'),
};

// Platform Settings hooks
export const usePlatformLimits = () => {
  return useQuery({
    queryKey: ['platform-settings', 'limits'],
    queryFn: platformSettingsApi.getLimits,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: platformSettingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlatformFees = () => {
  return useQuery({
    queryKey: ['platform-settings', 'fees'],
    queryFn: platformSettingsApi.getFees,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlatformFeatures = () => {
  return useQuery({
    queryKey: ['platform-settings', 'features'],
    queryFn: platformSettingsApi.getFeatures,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: platformSettingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: platformSettingsApi.updateMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });
};

export const useResetPlatformDefaults = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: platformSettingsApi.resetDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });
};