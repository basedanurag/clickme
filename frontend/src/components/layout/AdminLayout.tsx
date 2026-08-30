import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Link as LinkIcon, ShieldAlert, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'URLs', href: '/admin/urls', icon: LinkIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">ClickMe Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/dashboard"
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
          >
            <ExternalLink className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Exit Admin
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-900">
            {navigation.find(n => location.pathname === n.href || (n.href !== '/admin' && location.pathname.startsWith(n.href)))?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Admin
            </span>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
