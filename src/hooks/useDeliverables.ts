import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliverablesApi } from '@/lib/api';
import type { DeliverableCreate } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

// Influencer hooks
export const useInfluencerDeliverables = () => {
  return useQuery({
    queryKey: ['deliverables', 'influencer'],
    queryFn: () => deliverablesApi.influencer.list(),
  });
};

export const useSubmitDeliverable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: DeliverableCreate) => deliverablesApi.influencer.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', 'influencer'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: 'Sent for approval',
        description: "The brand has been notified. You'll hear back here.",
      });
    },
    onError: (error: any) => {
      const data = error.response?.data;
      toast({
        title: "Couldn't submit",
        description: data?.error || data?.link?.[0] || 'Please check the link and try again.',
        variant: 'destructive',
      });
    },
  });
};

// Brand hooks
export const useBrandDeliverables = (campaignId?: string) => {
  return useQuery({
    queryKey: ['deliverables', 'brand', campaignId],
    queryFn: () => deliverablesApi.brand.list(campaignId),
  });
};

export const useReviewDeliverable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      status,
      feedback,
    }: {
      id: string;
      status: 'in_review' | 'approved' | 'rejected';
      feedback?: string;
    }) => deliverablesApi.brand.review(id, status, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', 'brand'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast({
        // No payment runs through FameSync, so this used to promise one
        // ("Payment will be processed automatically") that never happened.
        title:
          variables.status === 'approved'
            ? 'Content approved'
            : variables.status === 'rejected'
            ? 'Changes requested'
            : 'Marked as in review',
        description: 'The creator has been notified.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to review deliverable. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
