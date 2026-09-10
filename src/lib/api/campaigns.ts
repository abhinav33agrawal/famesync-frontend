import api from './config';
import type { Campaign, Application, ApplicationCreate, CampaignSuggestion } from './types';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export const campaignsApi = {
  // Brand endpoints
  brand: {
    list: async (): Promise<Campaign[]> => {
      const response = await api.get('/campaigns/brand/');
      return response.data;
    },

    create: async (data: Partial<Campaign>): Promise<Campaign> => {
      const response = await api.post('/campaigns/brand/create/', data);
      return response.data;
    },

    getSuggestions: async (): Promise<CampaignSuggestion[]> => {
      const response = await api.get('/campaigns/brand/suggestions/');
      return response.data;
    },

    get: async (slug: string): Promise<Campaign> => {
      const response = await api.get(`/campaigns/brand/${slug}/`);
      return response.data;
    },

    update: async (slug: string, data: Partial<Campaign>): Promise<Campaign> => {
      const response = await api.put(`/campaigns/brand/${slug}/`, data);
      return response.data;
    },

    delete: async (slug: string): Promise<void> => {
      await api.delete(`/campaigns/brand/${slug}/`);
    },

    updateStatus: async (slug: string, status: CampaignStatus): Promise<Campaign> => {
      const response = await api.put(`/campaigns/brand/${slug}/status/`, { status });
      return response.data;
    },
  },

  // Influencer endpoints
  influencer: {
    list: async (params?: {
      category?: string;
      min_budget?: number;
      max_budget?: number;
      location?: string;
    }): Promise<Campaign[]> => {
      const response = await api.get('/campaigns/influencer/', { params });
      return response.data;
    },

    get: async (slug: string): Promise<Campaign> => {
      const response = await api.get(`/campaigns/influencer/${slug}/`);
      return response.data;
    },

    apply: async (data: ApplicationCreate): Promise<Application> => {
      const response = await api.post('/campaigns/influencer/apply/', data);
      return response.data;
    },

    getApplications: async (): Promise<Application[]> => {
      const response = await api.get('/campaigns/influencer/applications/');
      return response.data;
    },
  },

  // Application management
  updateApplicationStatus: async (
    id: number,
    status: 'accepted' | 'rejected',
    declineReason?: string
  ): Promise<Application> => {
    const payload: { status: string; decline_reason?: string } = { status };
    if (status === 'rejected' && declineReason) {
      payload.decline_reason = declineReason;
    }
    const response = await api.put(`/campaigns/applications/${id}/status/`, payload);
    return response.data;
  },
};
