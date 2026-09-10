import api from './config';

export interface Notification {
  id: number;
  message: string;
  created_at: string;
  status: 'unread' | 'read';
}

export const notificationsApi = {
  getUnread: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/unread/');
    return response.data;
  },

  markAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post('/notifications/mark-as-read/');
    return response.data;
  },

  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/all/');
    return response.data;
  },
};
