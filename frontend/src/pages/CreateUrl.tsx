import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { urlApi } from '../api/urlApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { LinkIcon, ArrowLeft, CheckCircle2 } from 'lucide-react';

const createUrlSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL (e.g. https://example.com)'),
  customAlias: z.string()
    .regex(/^[a-zA-Z0-9-_]*$/, 'Only letters, numbers, dashes, and underscores allowed')
    .max(50, 'Alias too long')
    .optional(),
  expiration: z.string().optional(),
});

type CreateUrlFormValues = z.infer<typeof createUrlSchema>;

export default function CreateUrl() {
  const navigate = useNavigate();
  const [aliasStatus, setAliasStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [createdUrl, setCreatedUrl] = useState<any>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateUrlFormValues>({
    resolver: zodResolver(createUrlSchema),
    defaultValues: {
      expiration: 'never'
    }
  });

  const customAlias = watch('customAlias');

  useEffect(() => {
    if (!customAlias) {
      setAliasStatus('idle');
      return;
    }

    const timer = setTimeout(() => {
      // Mocking alias availability check since backend lacks this endpoint
      setAliasStatus('checking');
      setTimeout(() => {
        // Arbitrary mock logic for demonstration
        if (customAlias === 'admin' || customAlias === 'test') {
          setAliasStatus('taken');
        } else {
          setAliasStatus('available');
        }
      }, 500);
    }, 500);

    return () => clearTimeout(timer);
  }, [customAlias]);

  const onSubmit = async (data: CreateUrlFormValues) => {
    if (aliasStatus === 'taken') {
      toast.error('Please choose a different alias');
      return;
    }

    try {
      let expiresAt = undefined;
      if (data.expiration && data.expiration !== 'never') {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(data.expiration));
        expiresAt = date.toISOString();
      }

      const response = await urlApi.createUrl({
        originalUrl: data.originalUrl,
        customAlias: data.customAlias || undefined,
        expiresAt: expiresAt,
      });
      setCreatedUrl(response);
      reset({ originalUrl: '', customAlias: '', expiration: 'never' });
      toast.success('URL created successfully!');
    } catch (error) {
      // Handled by interceptor
    }
  };

  const copyToClipboard = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl.shortUrl);
      toast.success('Copied to clipboard!');
    }
  };

  if (createdUrl) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your link is ready!</h2>
            <p className="text-muted-foreground mt-2">Share this link anywhere.</p>
          </div>
          
          <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between border border-border">
            <a href={createdUrl.shortUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-primary hover:underline truncate">
              {createdUrl.shortUrl}
            </a>
            <Button variant="secondary" size="sm" onClick={copyToClipboard} className="ml-4">
              Copy
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => navigate(`/urls/${createdUrl.id}/qr`)}>
              Get QR Code
            </Button>
            <Button variant="outline" onClick={() => navigate(`/urls/${createdUrl.id}/analytics`)}>
              View Analytics
            </Button>
            <Button variant="primary" onClick={() => setCreatedUrl(null)}>
              Create Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Short Link</h1>
        <p className="text-muted-foreground mt-1">Paste your long URL below to generate a trackable short link.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Destination URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                placeholder="https://example.com/very-long-url"
                className="pl-10"
                {...register('originalUrl')}
                error={errors.originalUrl?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custom Alias (Optional)</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground bg-accent px-3 py-2 rounded-md border border-border text-sm hidden sm:block">
                clickme.app/
              </span>
              <div className="flex-1 relative">
                <Input
                  placeholder="my-campaign"
                  {...register('customAlias')}
                  error={errors.customAlias?.message}
                />
                {customAlias && (
                  <div className="absolute right-3 top-2.5">
                    {aliasStatus === 'checking' && <span className="text-xs text-muted-foreground">Checking...</span>}
                    {aliasStatus === 'available' && <span className="text-xs text-emerald-500 font-medium">✓ Available</span>}
                    {aliasStatus === 'taken' && <span className="text-xs text-destructive font-medium">✕ Taken</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Expiration</label>
            <select
              {...register('expiration')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              <option value="never">Never expire</option>
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')} className="mr-3">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Short URL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
