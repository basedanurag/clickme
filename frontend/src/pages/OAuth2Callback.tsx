import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import axios from 'axios';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    
    const token = searchParams.get('code');
    
    if (!token) {
      toast.error('Authentication failed. No code provided.');
      navigate('/login');
      return;
    }

    processed.current = true;

    const processLogin = async () => {
      try {
        const response = await authApi.oauth2Callback(token);
        
        // Fetch the actual user profile immediately to check the role
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const userRes = await axios.get(`${baseURL}/auth/me`, {
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });
        const user = userRes.data;

        const intent = localStorage.getItem('loginIntent');
        localStorage.removeItem('loginIntent');

        if (intent === 'admin') {
          if (user.role !== 'ROLE_ADMIN') {
            toast.error('Access Denied. You do not have administrative privileges.');
            navigate('/admin/login');
            return;
          }
          login(response.accessToken, user);
          toast.success('Welcome to the Admin Panel');
          navigate('/admin');
          return;
        }

        // Normal flow
        login(response.accessToken, user);
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard');
      } catch (err: any) {
        toast.error('Google authentication failed. Please try again.');
        navigate('/login');
      }
    };

    processLogin();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-medium">Completing login...</p>
      </div>
    </div>
  );
}
