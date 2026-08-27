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
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good morning, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here is what's happening with your links today.</p>
        </div>
        
        <form onSubmit={handleSubmit(onQuickCreate)} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Paste your long URL"
                {...register('originalUrl')}
                error={errors.originalUrl?.message}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                placeholder="Custom alias (opt)"
                {...register('customAlias')}
                error={errors.customAlias?.message}
              />
            </div>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="whitespace-nowrap">
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
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Recent Links</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/urls')}>
              View all <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
          
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : urls.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No links created yet.</div>
            ) : (
              urls.slice(0, 5).map(url => (
                <div key={url.id} className="p-6 hover:bg-accent/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline truncate">
                        {url.shortCode}
                      </a>
                      {url.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{url.originalUrl}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{url.clickCount}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/urls/${url.id}/analytics`)}>
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
