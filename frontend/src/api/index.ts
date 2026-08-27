import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Unable to connect to ClickMe. The server may be temporarily unavailable.');
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status === 409) {
      toast.error(message || 'Conflict occurred.');
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (status >= 500) {
      toast.error('Internal server error. Our team has been notified.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
