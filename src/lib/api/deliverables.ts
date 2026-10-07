import api from './config';
import type { Deliverable, DeliverableCreate } from './types';

export const deliverablesApi = {
  // Influencer endpoints
  influencer: {
    submit: async (data: DeliverableCreate): Promise<Deliverable> => {
      const formData = new FormData();
      formData.append('application', data.application.toString());
      formData.append('deliverable_type', data.deliverable_type);
      formData.append('link', data.link);
      if (data.description) formData.append('description', data.description);
      if (data.file) formData.append('file', data.file);

      const response = await api.post('/deliverables/submit/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    list: async (): Promise<Deliverable[]> => {
      const response = await api.get('/deliverables/influencer/');
      return response.data;
    },
  },

  // Brand endpoints
  brand: {
    list: async (campaignId?: string): Promise<Deliverable[]> => {
      const params = campaignId ? { campaign_id: campaignId } : {};
      const response = await api.get('/deliverables/brand/', { params });
      return response.data;
    },

    review: async (
      id: string,
      status: 'in_review' | 'approved' | 'rejected',
      feedback?: string
    ): Promise<Deliverable> => {
      const response = await api.put(`/deliverables/${id}/review/`, {
        status,
        feedback,
      });
      return response.data;
    },
  },

  // Get single deliverable
  get: async (id: string): Promise<Deliverable> => {
    const response = await api.get(`/deliverables/${id}/`);
    return response.data;
  },
};
