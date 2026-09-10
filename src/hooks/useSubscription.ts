import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import type { Subscription } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

export const useSubscription = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.get(),
    enabled,
    staleTime: 0, // Don't cache subscription info, credits can change
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (plan: 'free' | 'pro') => subscriptionsApi.update(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'Subscription Updated',
        description: 'Your subscription plan has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUsageHistory = (params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ['usage', params],
    queryFn: () => subscriptionsApi.getUsage(params),
  });
};

export const useTrackUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { action: string; credits_used: number; details?: string }) =>
      subscriptionsApi.trackUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      queryClient.invalidateQueries({ queryKey: ['credit-usage'] });
      queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
    },
  });
};

// New hooks for daily credit usage
export const useCreditUsageInfo = () => {
  return useQuery({
    queryKey: ['credit-usage'],
    queryFn: () => subscriptionsApi.getCreditUsageInfo(),
    staleTime: 0,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useCheckCreditAvailability = () => {
  return useMutation({
    mutationFn: (creditsNeeded: number = 1) =>
      subscriptionsApi.checkCreditAvailability(creditsNeeded),
  });
};

export const useDailyStats = () => {
  return useQuery({
    queryKey: ['daily-stats'],
    queryFn: () => subscriptionsApi.getDailyStats(),
    staleTime: 0,
    refetchInterval: 60000, // Refetch every minute for daily stats
  });
};

