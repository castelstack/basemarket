// api/notifications.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  Notification,
  NotificationPreferences,
  NotificationParams,
  ApiResponse,
} from '../types/api';

// Notifications API functions
export const notificationsApi = {
  getNotifications: (params?: NotificationParams) => {
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
      docs: Notification[]; 
      totalDocs: number; 
      page: number; 
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
      pagingCounter: number;
    }>(`/api/v1/notifications${queryString ? `?${queryString}` : ''}`);
  },
  
  getUnreadCount: () => 
    apiClient.get<{ count: number }>('/api/v1/notifications/unread-count'),
  
  getPreferences: () => 
    apiClient.get<NotificationPreferences>('/api/v1/notifications/preferences'),
  
  updatePreferences: (data: NotificationPreferences) => 
    apiClient.patch<NotificationPreferences>('/api/v1/notifications/preferences', data),
  
  markAsRead: (id: string) => 
    apiClient.patch(`/api/v1/notifications/${id}/read`),
  
  markAllAsRead: () => 
    apiClient.post('/api/v1/notifications/mark-all-read'),
  
  deleteNotification: (id: string) => 
    apiClient.delete(`/api/v1/notifications/${id}`),
};

// Notifications hooks
export const useNotifications = (params?: NotificationParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.getNotifications(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useUnreadNotificationsCount = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user, // Only fetch when user is logged in
    retry: false, // Don't retry on failure
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: notificationsApi.getPreferences,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};