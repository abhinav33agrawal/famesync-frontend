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
        title: 'Deliverable Submitted',
        description: 'Your deliverable has been submitted for review.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit deliverable. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Brand hooks
export const useBrandDeliverables = (campaignId?: number) => {
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
      id: number;
      status: 'in_review' | 'approved' | 'rejected';
      feedback?: string;
    }) => deliverablesApi.brand.review(id, status, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliverables', 'brand'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast({
        title:
          variables.status === 'approved'
            ? 'Deliverable Approved'
            : variables.status === 'rejected'
            ? 'Deliverable Rejected'
            : 'Deliverable Under Review',
        description:
          variables.status === 'approved' ? 'Payment will be processed automatically.' : 'The influencer has been notified.',
        variant: variables.status === 'rejected' ? 'destructive' : 'default',
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
