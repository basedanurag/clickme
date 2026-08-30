import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Search, Link as LinkIcon, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUrls: React.FC = () => {
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUrls = () => {
    setLoading(true);
    adminApi.getUrls('', page)
      .then(data => {
        setUrls(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load URLs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUrls();
  }, [page]);

  const toggleStatus = (id: number, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this URL?`)) return;
    
    adminApi.changeUrlStatus(id, !currentStatus)
      .then(() => {
        toast.success(currentStatus ? 'URL disabled' : 'URL enabled');
        fetchUrls();
      })
      .catch(e => toast.error(e.response?.data?.message || 'Failed to update URL'));
  };

  const deleteUrl = (id: number) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this URL?')) return;
    
    adminApi.deleteUrl(id)
      .then(() => {
        toast.success('URL deleted');
        fetchUrls();
      })
      .catch(e => toast.error(e.response?.data?.message || 'Failed to delete URL'));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-gray-500" />
          System URLs
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Short Code</th>
              <th className="px-6 py-4">Original URL</th>
              <th className="px-6 py-4">Owner Email</th>
              <th className="px-6 py-4">Clicks</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && urls.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : urls.map(url => (
              <tr key={url.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-blue-600">
                  /{url.shortCode}
                </td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={url.originalUrl}>
                  {url.originalUrl}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {url.ownerEmail}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-700">
                  {url.clickCount}
                </td>
                <td className="px-6 py-4">
                  {url.active ? (
                    <span className="inline-flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1"/> Active</span>
                  ) : (
                    <span className="inline-flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1"/> Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                      onClick={() => toggleStatus(url.id, url.active)}
                      className="text-orange-600 hover:text-orange-800 font-medium mr-4"
                    >
                      {url.active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => deleteUrl(url.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <button 
          disabled={page === 0} 
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">Page {page + 1} of {Math.max(1, totalPages)}</span>
        <button 
          disabled={page >= totalPages - 1} 
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
