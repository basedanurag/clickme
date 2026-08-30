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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total URLs', value: stats.totalUrls, icon: LinkIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Today', value: stats.clicksToday, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Growth (Users)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New Users Today</span>
              <span className="font-bold text-gray-900">{stats.newUsersToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New Users This Week</span>
              <span className="font-bold text-gray-900">{stats.newUsersThisWeek.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Growth (URLs)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New URLs Today</span>
              <span className="font-bold text-gray-900">{stats.newUrlsToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New URLs This Week</span>
              <span className="font-bold text-gray-900">{stats.newUrlsThisWeek.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
