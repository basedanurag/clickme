import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { Link } from 'react-router-dom';
import { Search, MoreVertical, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers(search, page)
      .then(data => {
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load users');
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const toggleStatus = (userId: number, currentStatus: boolean) => {
    adminApi.changeUserStatus(userId, !currentStatus)
      .then(() => {
        toast.success(currentStatus ? 'User disabled' : 'User enabled');
        setActionUserId(null);
        fetchUsers();
      })
      .catch(e => {
        toast.error(e.response?.data?.message || 'Action failed');
      });
  };

  const toggleRole = (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    adminApi.changeUserRole(userId, newRole)
      .then(() => {
        toast.success('Role updated');
        setActionUserId(null);
        fetchUsers();
      })
      .catch(e => {
        toast.error(e.response?.data?.message || 'Action failed');
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {user.provider}
                </td>
                <td className="px-6 py-4">
                  {user.active ? (
                    <span className="inline-flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1"/> Active</span>
                  ) : (
                    <span className="inline-flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1"/> Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setActionUserId(actionUserId === user.id ? null : user.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {actionUserId === user.id && (
                    <div className="absolute right-8 top-10 w-48 bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-10 text-left">
                      <Link to={`/admin/users/${user.id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left">View Details</Link>
                      <button 
                        onClick={() => toggleRole(user.id, user.role)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        {user.role === 'ROLE_ADMIN' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button 
                        onClick={() => toggleStatus(user.id, user.active)}
                        className={`block px-4 py-2 w-full text-left ${user.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {user.active ? 'Disable Account' : 'Enable Account'}
                      </button>
                    </div>
                  )}
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
