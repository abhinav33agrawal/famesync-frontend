import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, CampaignStatus } from '@/lib/api/campaigns';
import type { Campaign, ApplicationCreate } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

// Brand hooks
export const useBrandCampaigns = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['campaigns', 'brand'],
    queryFn: () => campaignsApi.brand.list(),
    enabled,
  });
};

export const useBrandCampaign = (slug: string) => {
  return useQuery({
    queryKey: ['campaign', 'brand', slug],
    queryFn: () => campaignsApi.brand.get(slug),
    enabled: !!slug,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Campaign>) => campaignsApi.brand.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'brand'] });
      // Refresh user data to update credit balance
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created successfully.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to create campaign. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCampaign = (slug: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Campaign>) => campaignsApi.brand.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'brand'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', 'brand', slug] });
      toast({
        title: 'Campaign Updated',
        description: 'Your campaign has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update campaign. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (slug: string) => campaignsApi.brand.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'brand'] });
      toast({
        title: 'Campaign Deleted',
        description: 'Your campaign has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusMessages: Record<CampaignStatus, { title: string; description: string }> = {
    active: { title: 'Campaign Published', description: 'Your campaign is now live and visible to influencers.' },
    completed: { title: 'Campaign Completed', description: 'Your campaign has been marked as completed.' },
    cancelled: { title: 'Campaign Cancelled', description: 'Your campaign has been cancelled.' },
    draft: { title: 'Campaign Saved', description: 'Your campaign has been saved as a draft.' },
  };

  return useMutation({
    mutationFn: ({ slug, status }: { slug: string; status: CampaignStatus }) =>
      campaignsApi.brand.updateStatus(slug, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'brand'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', 'brand', variables.slug] });
      // Refresh user data to update credit balance
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      const message = statusMessages[variables.status];
      toast({
        title: message.title,
        description: message.description,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to update campaign status.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Influencer hooks
export const useInfluencerCampaigns = (
  params?: {
    category?: string;
    min_budget?: number;
    max_budget?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['campaigns', 'influencer', params],
    queryFn: () => campaignsApi.influencer.list(params),
    enabled,
  });
};

export const useInfluencerCampaign = (slug: string) => {
  return useQuery({
    queryKey: ['campaign', 'influencer', slug],
    queryFn: () => campaignsApi.influencer.get(slug),
    enabled: !!slug,
  });
};

export const useApplyToCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ApplicationCreate) => campaignsApi.influencer.apply(data),
    onSuccess: (response) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'influencer'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      // Refresh user data to update credit balance
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      const creditsRemaining = (response as any)?.credits_remaining;
      toast({
        title: 'Application Submitted! 🎉',
        description: creditsRemaining !== undefined
          ? `The brand will review your application. (${creditsRemaining} credits remaining)`
          : 'The brand will review your application.',
      });
    },
    onError: (error: any) => {
      const errorData = error.response?.data;

      // Handle specific error types
      if (errorData?.already_applied) {
        toast({
          title: 'Already Applied',
          description: 'You have already applied to this campaign.',
          variant: 'destructive',
        });
      } else if (errorData?.insufficient_credits) {
        toast({
          title: 'Insufficient Credits',
          description: 'You need at least 1 credit to apply. Upgrade your plan for more credits.',
          variant: 'destructive',
        });
      } else if (errorData?.retry) {
        toast({
          title: 'Please Try Again',
          description: 'Something went wrong. Please try again in a moment.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorData?.error || errorData?.detail || 'Failed to apply. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, declineReason }: {
      id: string;
      status: 'accepted' | 'rejected';
      declineReason?: string;
    }) =>
      campaignsApi.updateApplicationStatus(id, status, declineReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: variables.status === 'accepted' ? 'Application Approved' : 'Application Declined',
        description: 'The influencer has been notified with a polite message.',
        variant: variables.status === 'rejected' ? 'destructive' : 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
