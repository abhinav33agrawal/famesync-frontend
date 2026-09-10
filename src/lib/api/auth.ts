import api from './config';
import type { LoginResponse, RegisterData, User } from './types';

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  // Login user
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh: refreshToken });
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await api.post('/auth/refresh/', { refresh });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<any> => {
    const response = await api.get(`/auth/verify-email/?token=${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<any> => {
    const response = await api.post('/auth/resend-verification/', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<any> => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<any> => {
    const response = await api.post('/auth/reset-password/', { token, password });
    return response.data;
  },
};
