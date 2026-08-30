import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldAlert } from 'lucide-react';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // 1. Authenticate
      const response = await authApi.login({
        email: data.email,
        password: data.password
      });
      
      // 2. Fetch the actual user profile immediately to check the role
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const userRes = await axios.get(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${response.accessToken}` }
      });
      const user = userRes.data;

      // 3. Verify Admin Role
      if (user.role !== 'ROLE_ADMIN') {
        toast.error('Access Denied. You do not have administrative privileges.');
        logout();
        setIsLoading(false);
        return;
      }

      // 4. Login as Admin
      login(response.accessToken, user);
      toast.success('Welcome to the Admin Panel');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-xl shadow-2xl border border-gray-800">
        <div className="text-center flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-400">Authorized personnel only</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Admin Email"
                {...register('email')}
                error={errors.email?.message}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
                error={errors.password?.message}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" isLoading={isLoading}>
            Access Admin Panel
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center relative">
          <div className="border-t border-gray-800 w-full"></div>
          <span className="bg-black px-2 text-sm text-gray-400 absolute">Or continue with</span>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black font-semibold border border-gray-300"
            onClick={() => {
              localStorage.setItem('loginIntent', 'admin');
              const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
              window.location.href = `${baseUrl}/oauth2/authorization/google`;
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Return to standard user login
          </button>
        </div>
      </div>
    </div>
  );
}
