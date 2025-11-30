// api/stakes.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  Stake,
  CreateStakeRequest,
  StakesParams,
  CalculateWinningsParams,
  ApiResponse,
} from '../types/api';

// Stakes API functions
export const stakesApi = {
  createStake: (data: CreateStakeRequest) => 
    apiClient.post<Stake>('/api/v1/stakes', data),
  
  getMyStakes: (params?: StakesParams) => {
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
      docs: Stake[]; 
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
      `/api/v1/stakes/my${queryString ? `?${queryString}` : ''}`
    );
  },
  
  getStakeById: (id: string) => 
    apiClient.get<Stake>(`/api/v1/stakes/${id}`),
  
  getStakesByPoll: (pollId: string) => 
    apiClient.get<{ stakes: Stake[] }>(`/api/v1/stakes/poll/${pollId}`),
};

// Public Stakes API functions
export const publicStakesApi = {
  calculateWinnings: (params: CalculateWinningsParams) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    
    return apiClient.get<{
      grossWinnings: any;
      userSharePercentage: any;
      potentialWinnings: number;
      odds: number;
      totalPool: number;
      optionPool: number;
    }>(`/api/v1/public/stakes/calculate-winnings?${searchParams.toString()}`);
  },
};

// Stakes hooks
export const useCreateStake = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stakesApi.createStake,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stakes'] });
      queryClient.invalidateQueries({ queryKey: ['polls', variables.pollId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

export const useMyStakes = (params?: StakesParams) => {
  return useQuery({
    queryKey: ['stakes', 'my', params],
    queryFn: () => stakesApi.getMyStakes(params),
  });
};

export const useStakeById = (id: string) => {
  return useQuery({
    queryKey: ['stakes', id],
    queryFn: () => stakesApi.getStakeById(id),
    enabled: !!id,
  });
};

export const useStakesByPoll = (pollId: string) => {
  return useQuery({
    queryKey: ['stakes', 'poll', pollId],
    queryFn: () => stakesApi.getStakesByPoll(pollId),
    enabled: !!pollId,
  });
};

export const useCalculateWinnings = (params: CalculateWinningsParams) => {
  return useQuery({
    queryKey: ['stakes', 'calculate-winnings', params],
    queryFn: () => publicStakesApi.calculateWinnings(params),
    enabled: !!(params.pollId && params.selectedOptionId && params.amount >= 100),
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};