// api/polls.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  Poll,
  CreatePollRequest,
  UpdatePollRequest,
  ResolvePollRequest,
  PaginationParams,
  PublicPollsParams,
  ApiResponse,
} from '../types/api';

// Admin Polls API functions
export const adminPollsApi = {
  createPoll: (data: CreatePollRequest) => 
    apiClient.post<Poll>('/api/v1/polls', data),
  
  updatePoll: (id: string, data: UpdatePollRequest) => 
    apiClient.put<Poll>(`/api/v1/polls/${id}`, data),
  
  deletePoll: (id: string) => 
    apiClient.delete(`/api/v1/polls/${id}`),
  
  closePoll: (id: string) => 
    apiClient.post(`/api/v1/polls/${id}/close`),
  
  resolvePoll: (id: string, data: ResolvePollRequest) => 
    apiClient.post(`/api/v1/polls/${id}/resolve`, data),
  
  cancelPoll: (id: string) => 
    apiClient.post(`/api/v1/polls/${id}/cancel`),
};

// Public Polls API functions
export const publicPollsApi = {
  getAllPolls: (params?: PublicPollsParams) => {
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
      docs: Poll[]; 
      totalDocs: number; 
      page: number; 
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
      pagingCounter: number;
    }>(
      `/api/v1/public/polls${queryString ? `?${queryString}` : ''}`
    );
  },
  
  getPollById: (id: string) => 
    apiClient.get<Poll>(`/api/v1/public/polls/${id}`),
  
  getPollStats: (id: string) => 
    apiClient.get<{
      totalStakes: number;
      totalAmount: number;
      optionStats: Array<{
        optionId: string;
        stakes: number;
        amount: number;
        odds: number;
      }>;
    }>(`/api/v1/public/polls/${id}/stats`),
};

// Admin Poll hooks
export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminPollsApi.createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};

export const useUpdatePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePollRequest }) => 
      adminPollsApi.updatePoll(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
  });
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminPollsApi.deletePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
};

export const useClosePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminPollsApi.closePoll,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
  });
};

export const useResolvePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolvePollRequest }) => 
      adminPollsApi.resolvePoll(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
  });
};

export const useCancelPoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminPollsApi.cancelPoll,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', id] });
    },
  });
};

// Public Poll hooks
export const useAllPolls = (params?: PublicPollsParams) => {
  return useQuery({
    queryKey: ['polls', 'all', params],
    queryFn: () => publicPollsApi.getAllPolls(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const usePollById = (id: string) => {
  return useQuery({
    queryKey: ['polls', id],
    queryFn: () => publicPollsApi.getPollById(id),
    enabled: !!id,
  });
};

// Helper hook for paginated polls
export const usePaginatedPolls = (page: number = 1, limit: number = 10) => {
  return useAllPolls({ page, limit });
};

export const usePollStats = (id: string) => {
  return useQuery({
    queryKey: ['polls', id, 'stats'],
    queryFn: () => publicPollsApi.getPollStats(id),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};