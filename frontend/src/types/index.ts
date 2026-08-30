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

export interface AdminStatsDto {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  activeUsers: number;
}

export interface AdminUserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  provider: string;
  urlCount: number;
  clickCount: number;
}

export interface AuditLogDto {
  id: number;
  action: string;
  details: string;
  adminEmail: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

