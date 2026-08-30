import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Users, Link as LinkIcon, MousePointerClick, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUrlsToday: number;
  newUrlsThisWeek: number;
  clicksToday: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load dashboard stats');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20 shadow-[inset_0px_0px_20px_rgba(59,130,246,0.1)]' },
    { title: 'Total URLs', value: stats.totalUrls, icon: LinkIcon, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20 shadow-[inset_0px_0px_20px_rgba(34,197,94,0.1)]' },
    { title: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20 shadow-[inset_0px_0px_20px_rgba(168,85,247,0.1)]' },
    { title: 'Active Today', value: stats.clicksToday, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20 shadow-[inset_0px_0px_20px_rgba(249,115,22,0.1)]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.title}</p>
                <h3 className="text-4xl font-bold text-white">{stat.value.toLocaleString()}</h3>
              </div>
              <div className={`p-4 rounded-xl border ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Growth (Users)</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-gray-400 font-medium">New Users Today</span>
              <span className="text-xl font-bold text-white">{stats.newUsersToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-gray-400 font-medium">New Users This Week</span>
              <span className="text-xl font-bold text-white">{stats.newUsersThisWeek.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Growth (URLs)</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-gray-400 font-medium">New URLs Today</span>
              <span className="text-xl font-bold text-white">{stats.newUrlsToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <span className="text-gray-400 font-medium">New URLs This Week</span>
              <span className="text-xl font-bold text-white">{stats.newUrlsThisWeek.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
