import api from './config';
import type { InfluencerProfile, BrandProfile, InfluencerDashboardStats, BrandDashboardStats } from './types';

export const profilesApi = {
  // Influencer endpoints
  influencer: {
    setup: async (data: Partial<InfluencerProfile>): Promise<InfluencerProfile> => {
      const response = await api.post('/influencer/setup/', data);
      return response.data;
    },

    update: async (data: Partial<InfluencerProfile>): Promise<InfluencerProfile> => {
      const response = await api.put('/influencer/setup/', data);
      return response.data;
    },

    getProfile: async (): Promise<InfluencerProfile> => {
      const response = await api.get('/influencer/profile/');
      return response.data;
    },

    getDashboard: async (): Promise<InfluencerDashboardStats> => {
      const response = await api.get('/influencer/dashboard/');
      return response.data;
    },
  },

  // Brand endpoints
  brand: {
    setup: async (data: Partial<BrandProfile>): Promise<BrandProfile> => {
      const response = await api.post('/brand/setup/', data);
      return response.data;
    },

    update: async (data: Partial<BrandProfile>): Promise<BrandProfile> => {
      const response = await api.put('/brand/setup/', data);
      return response.data;
    },

    getProfile: async (): Promise<BrandProfile> => {
      const response = await api.get('/brand/profile/');
      return response.data;
    },

    getDashboard: async (): Promise<BrandDashboardStats> => {
      const response = await api.get('/brand/dashboard/');
      return response.data;
    },
  },
};
