import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { urlApi } from '../api/urlApi';
import type { UrlResponse, AnalyticsResponse } from '../types';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { ArrowLeft, MousePointerClick, Globe, Monitor, Compass, MapPin, LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [url, setUrl] = useState<UrlResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const chartTextColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
  const chartGridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 / slate-200
  const chartTooltipBg = isDark ? '#1e293b' : '#ffffff'; // slate-800 / white
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  useEffect(() => {
    fetchData();
  }, [id, dateRange]);

  const fetchData = async () => {
    try {
      if (!id) return;
      // In a real app, dateRange would be passed to the API
      const [urlData, analyticsData] = await Promise.all([
        urlApi.getUrl(parseInt(id)),
        urlApi.getAnalytics(parseInt(id))
      ]);
      setUrl(urlData);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading analytics data...</div>;
  }

  if (!url || !analytics) {
    return (
      <div className="text-center p-12">
        <p className="text-destructive mb-4">Analytics not found</p>
        <Button onClick={() => navigate('/urls')}>Back to Links</Button>
      </div>
    );
  }

  const formatData = (data: Record<string, number> | undefined) => {
    if (!data) return [];
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const browserData = formatData(analytics.browsers);
  const osData = formatData(analytics.operatingSystems);
  const referrerData = formatData(analytics.referrers);

  // Mock geographic data since backend doesn't provide it yet
  const geoData = [
    { name: 'United States', value: Math.floor(url.clickCount * 0.4) },
    { name: 'United Kingdom', value: Math.floor(url.clickCount * 0.2) },
    { name: 'India', value: Math.floor(url.clickCount * 0.15) },
    { name: 'Germany', value: Math.floor(url.clickCount * 0.1) },
    { name: 'Other', value: url.clickCount - Math.floor(url.clickCount * 0.85) },
  ].filter(d => d.value > 0);

  const customTooltipStyle = {
    backgroundColor: chartTooltipBg,
    borderColor: chartTooltipBorder,
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/urls')}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Back to Links
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <div className="flex items-center gap-2 mt-1">
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              /{url.shortCode}
            </a>
            <span className="text-muted-foreground text-sm truncate max-w-xs md:max-w-md" title={url.originalUrl}>
              → {url.originalUrl}
            </span>
          </div>
        </div>
        
        <div className="bg-card border border-border p-1 rounded-lg flex text-sm">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
                dateRange === range 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {range === 'all' ? 'All time' : range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Clicks"
          value={url.clickCount.toLocaleString()}
          icon={MousePointerClick}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Unique Devices"
          value={analytics.devices ? Object.keys(analytics.devices).length : 0}
          icon={Monitor}
        />
        <StatCard
          title="Top Region"
          value={geoData.length > 0 ? geoData[0].name : '-'}
          icon={MapPin}
          description="Requires Backend Update"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geographic Distribution (Mocked) */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Geographic Distribution</h3>
          </div>
          <div className="h-64">
            {geoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} width={100} />
                  <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 border-t border-border pt-4">
            Note: Geographic data is currently mocked. Backend geo-IP support required.
          </p>
        </div>

        {/* Operating Systems */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Operating Systems</h3>
          </div>
          <div className="h-64">
            {osData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {osData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {osData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Compass className="text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Browsers</h3>
          </div>
          <div className="h-64">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12 }} />
                  <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Top Referrers</h3>
          </div>
          <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
            {referrerData.length > 0 ? (
              <div className="space-y-4">
                {referrerData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-muted-foreground flex-shrink-0">
                        {entry.name === 'Direct' ? <Globe size={14} /> : <LinkIcon size={14} />}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate" title={entry.name}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground bg-accent px-2 py-1 rounded">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
