import api from './index';
import type { UrlResponse, CreateUrlRequest, AnalyticsResponse } from '../types';

export const urlApi = {
  createUrl: async (data: CreateUrlRequest): Promise<UrlResponse> => {
    const response = await api.post('/url/shorten', data);
    return response.data;
  },
  getMyUrls: async (): Promise<UrlResponse[]> => {
    const response = await api.get('/url/my-urls');
    return response.data;
  },
  getUrl: async (id: number): Promise<UrlResponse> => {
    // Actually, backend has '/url/my-urls' but maybe not '/url/{id}'. 
    // We can fetch all and filter for now as a fallback since the backend lacks GET /url/{id}.
    const urls = await api.get('/url/my-urls');
    const url = urls.data.find((u: UrlResponse) => u.id === id);
    if (!url) throw new Error('URL not found');
    return url;
  },
  deleteUrl: async (id: number): Promise<void> => {
    await api.delete(`/url/${id}`);
  },
  getAnalytics: async (id: number): Promise<AnalyticsResponse> => {
    // Assuming GET /api/analytics/{id} or /api/url/{id}/analytics exists. 
    // Previous code suggests `/analytics/` endpoint or `analyticsApi`?
    // Let's use `/analytics/url/{id}` as per previous implementation (or just /analytics/{id})
    const response = await api.get(`/analytics/${id}`);
    return response.data;
  },
  getQrCode: async (urlId: number): Promise<Blob> => {
    // Fetch QR Code as blob instead of returning URL string
    const response = await api.get(`/qr/${urlId}?size=250&format=png`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

