import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { urlApi } from '../api/urlApi';
import type { UrlResponse } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LinkIcon, MousePointerClick, CheckCircle2, XCircle, ArrowRight, Activity, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const quickCreateSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  customAlias: z.string()
    .regex(/^[a-zA-Z0-9-_]*$/, 'Only letters, numbers, dashes, and underscores allowed')
    .optional(),
});

type QuickCreateFormValues = z.infer<typeof quickCreateSchema>;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuickCreateFormValues>({
    resolver: zodResolver(quickCreateSchema),
  });
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await urlApi.getMyUrls();
      setUrls(data);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onQuickCreate = async (data: QuickCreateFormValues) => {
    try {
      await urlApi.createUrl({
        originalUrl: data.originalUrl,
        customAlias: data.customAlias || undefined,
      });
      toast.success('URL shortened successfully!');
      reset();
      fetchData(); // Refresh list
    } catch (error) {
      // Handled by interceptor
    }
  };

  const totalClicks = urls.reduce((acc, url) => acc + url.clickCount, 0);
  const activeUrls = urls.filter(u => u.active).length;
  const expiredUrls = urls.filter(u => u.expiresAt && new Date(u.expiresAt) < new Date()).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Quick Create */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="z-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{getGreeting()}, {user?.name || 'there'}!</h1>
          <p className="text-gray-400 mt-2 text-lg">Here is what's happening with your links today.</p>
        </div>
        
        <form onSubmit={handleSubmit(onQuickCreate)} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Paste your long URL"
                {...register('originalUrl')}
                error={errors.originalUrl?.message}
                className="bg-black/50 border-gray-800 text-white focus:ring-primary/50"
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                placeholder="Custom alias (opt)"
                {...register('customAlias')}
                error={errors.customAlias?.message}
                className="bg-black/50 border-gray-800 text-white focus:ring-primary/50"
              />
            </div>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="whitespace-nowrap bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            Shorten URL
          </Button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Links"
          value={isLoading ? '-' : urls.length}
          icon={LinkIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Clicks"
          value={isLoading ? '-' : totalClicks}
          icon={MousePointerClick}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Active Links"
          value={isLoading ? '-' : activeUrls}
          icon={CheckCircle2}
        />
        <StatCard
          title="Expired/Disabled"
          value={isLoading ? '-' : expiredUrls + (urls.length - activeUrls - expiredUrls)}
          icon={XCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Links */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Links
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/urls')} className="text-gray-400 hover:text-white">
              View all <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          
          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse">Loading links...</div>
            ) : urls.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No links created yet.</div>
            ) : (
              urls.slice(0, 5).map(url => (
                <div key={url.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-lg hover:text-blue-400 transition-colors truncate">
                        {url.shortCode}
                      </a>
                      {url.active ? (
                        <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate group-hover:text-gray-400 transition-colors">{url.originalUrl}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{url.clickCount}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Clicks</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/urls/${url.id}/analytics`)} className="border-gray-700 hover:bg-white/10 hover:text-white">
                      Analytics
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
