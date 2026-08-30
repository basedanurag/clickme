export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  message: string;
}

export interface UrlResponse {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  category: string;
}

export interface AnalyticsResponse {
  browsers: Record<string, number>;
  devices: Record<string, number>;
  operatingSystems: Record<string, number>;
  referrers: Record<string, number>;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string;
}

