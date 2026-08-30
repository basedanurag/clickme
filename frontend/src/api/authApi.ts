import api from './index';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  signup: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  oauth2Callback: async (token: string): Promise<AuthResponse> => {
    const response = await api.post(`/auth/oauth2/callback?token=${token}`);
    return response.data;
  }
};

