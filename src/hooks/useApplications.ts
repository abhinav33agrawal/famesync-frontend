import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api';

export const useInfluencerApplications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['applications', 'influencer'],
    queryFn: () => campaignsApi.influencer.getApplications(),
    enabled,
  });
};
