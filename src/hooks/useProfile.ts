import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import type { InfluencerProfile, BrandProfile } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

// Influencer hooks
export const useInfluencerProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile', 'influencer'],
    queryFn: () => profilesApi.influencer.getProfile(),
    enabled,
  });
};

export const useUpdateInfluencerProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<InfluencerProfile>) => profilesApi.influencer.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'influencer'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useInfluencerDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['dashboard', 'influencer'],
    queryFn: () => profilesApi.influencer.getDashboard(),
    enabled,
  });
};

// Brand hooks
export const useBrandProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile', 'brand'],
    queryFn: () => profilesApi.brand.getProfile(),
    enabled,
  });
};

export const useUpdateBrandProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<BrandProfile>) => profilesApi.brand.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'brand'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useBrandDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['dashboard', 'brand'],
    queryFn: () => profilesApi.brand.getDashboard(),
    enabled,
  });
};
