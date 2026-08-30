import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Calendar, Activity, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      adminApi.getUserDetails(Number(id)),
      adminApi.getUserUrls(Number(id))
    ])
    .then(([userData, urlsData]) => {
      setUser(userData);
      setUrls(urlsData.content);
      setLoading(false);
    })
    .catch(() => {
      toast.error('Failed to load user details');
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {user.email}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> {user.active ? 'Active' : 'Disabled'}</span>
              </div>
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Standard User'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            User's URLs ({user.totalUrls})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Short Code</th>
                <th className="px-6 py-4">Original URL</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {urls.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No URLs found for this user.</td></tr>
              ) : urls.map(url => (
                <tr key={url.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">
                    <a href={`/${url.shortCode}`} target="_blank" rel="noreferrer">/{url.shortCode}</a>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={url.originalUrl}>
                    {url.originalUrl}
                  </td>
                  <td className="px-6 py-4">{url.clickCount}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(url.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
