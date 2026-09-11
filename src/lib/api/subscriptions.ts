import api from './config';
import type { Subscription, UsageTracker } from './types';

export const subscriptionsApi = {
  // Get subscription details
  get: async (): Promise<Subscription> => {
    const response = await api.get('/subscriptions/');
    return response.data;
  },

  // Update subscription plan
  update: async (plan: 'free' | 'pro'): Promise<Subscription> => {
    const response = await api.put('/subscriptions/update/', { plan });
    return response.data;
  },

  // Get usage history
  getUsage: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<UsageTracker[]> => {
    const response = await api.get('/subscriptions/usage/', { params });
    return response.data;
  },

  // Track usage
  trackUsage: async (data: {
    action: string;
    credits_used: number;
    details?: string;
  }): Promise<UsageTracker> => {
    const response = await api.post('/subscriptions/track/', data);
    return response.data;
  },

  // Get credit usage info (including daily limits)
  getCreditUsageInfo: async (): Promise<{
    plan: string;
    credits_remaining: number;
    monthly_limit: number;
    monthly_usage: number;
    daily_limit: number | null;
    daily_usage: number | null;
    credits_remaining_today: number | null;
    is_pro: boolean;
  }> => {
    const response = await api.get('/subscriptions/credit-usage/');
    return response.data;
  },

  // Check credit availability before action
  checkCreditAvailability: async (creditsNeeded: number = 1): Promise<{
    allowed: boolean;
    error?: string;
    error_type?: string;
    credits_remaining?: number;
    credits_needed?: number;
    upgrade_required?: boolean;
    daily_usage?: number;
    daily_limit?: number;
    credits_remaining_today?: number;
  }> => {
    const response = await api.post('/subscriptions/check-credits/', { 
      credits_needed: creditsNeeded 
    });
    return response.data;
  },

  // Get daily usage statistics
  getDailyStats: async (): Promise<{
    has_daily_limit: boolean;
    daily_limit?: number;
    today_usage?: number;
    today_remaining?: number;
    today_percentage?: number;
    daily_usage?: Array<{
      date: string;
      day: number;
      credits_used: number;
      limit: number;
      remaining: number;
      percentage: number;
    }>;
    month_stats?: {
      total_days: number;
      days_with_usage: number;
      total_monthly_usage: number;
    };
    message?: string;
  }> => {
    const response = await api.get('/subscriptions/daily-stats/');
    return response.data;
  },

  // Generic payment creation
  createPayment: async (gateway: 'stripe' | 'razorpay'): Promise<any> => {
    const response = await api.post('/subscriptions/payment/create/', { gateway });
    return response.data;
  },

  // Generic payment verification
  verifyPayment: async (data: any): Promise<any> => {
    const response = await api.post('/subscriptions/payment/verify/', data);
    return response.data;
  },
};
