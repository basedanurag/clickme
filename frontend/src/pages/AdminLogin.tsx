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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
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

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" isLoading={isLoading}>
            Access Admin Panel
          </Button>
        </form>

        <div className="mt-6 text-center">
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
