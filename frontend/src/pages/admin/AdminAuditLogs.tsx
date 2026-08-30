import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLogs = () => {
    setLoading(true);
    adminApi.getAuditLogs(page)
      .then(data => {
        setLogs(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load audit logs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-gray-500" />
          System Audit Logs
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && logs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {log.adminEmail}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {log.targetType} ({log.targetId})
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {log.metadata || '-'}
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
