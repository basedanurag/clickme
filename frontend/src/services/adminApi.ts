import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const adminApiClient = axios.create({
  baseURL: `${baseURL}/admin`,
});

adminApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminApi = {
  getStats: () => adminApiClient.get('/dashboard/stats').then(res => res.data.data),
  
  getUsers: (search = '', page = 0, size = 10) => 
    adminApiClient.get(`/users?search=${search}&page=${page}&size=${size}`).then(res => res.data.data),
    
  getUserDetails: (id: number) => adminApiClient.get(`/users/${id}`).then(res => res.data.data),
  
  getUserUrls: (id: number, page = 0, size = 10) => 
    adminApiClient.get(`/users/${id}/urls?page=${page}&size=${size}`).then(res => res.data.data),
    
  changeUserRole: (id: number, role: string) => 
    adminApiClient.patch(`/users/${id}/role`, { role }).then(res => res.data),
    
  changeUserStatus: (id: number, active: boolean) => 
    adminApiClient.patch(`/users/${id}/status`, { active }).then(res => res.data),
    
  deleteUser: (id: number) => adminApiClient.delete(`/users/${id}`).then(res => res.data),

  getUrls: (search = '', page = 0, size = 10) => 
    adminApiClient.get(`/urls?search=${search}&page=${page}&size=${size}`).then(res => res.data.data),
    
  getUrlDetails: (id: number) => adminApiClient.get(`/urls/${id}`).then(res => res.data.data),
  
  changeUrlStatus: (id: number, active: boolean) => 
    adminApiClient.patch(`/urls/${id}/status`, { active }).then(res => res.data),
    
  deleteUrl: (id: number) => adminApiClient.delete(`/urls/${id}`).then(res => res.data),

  getAuditLogs: (page = 0, size = 10) => 
    adminApiClient.get(`/audit-logs?page=${page}&size=${size}`).then(res => res.data.data),
};
