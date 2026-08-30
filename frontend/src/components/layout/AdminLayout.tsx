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
    <div className="min-h-screen bg-black flex text-gray-100 selection:bg-blue-900/50">
      {/* Sidebar */}
      <div className="w-64 bg-black/60 backdrop-blur-xl border-r border-gray-800 flex flex-col fixed h-full z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-gradient-to-r from-blue-900/10 to-transparent">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
            Admin
          </span>
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
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0px_0px_10px_rgba(59,130,246,0.1)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'}
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-300
                      ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-110'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-800 space-y-2 bg-gradient-to-t from-black/80 to-transparent">
          <Link
            to="/dashboard"
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-white/5 hover:text-gray-100 transition-colors"
          >
            <ExternalLink className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-300" />
            Exit Admin
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 rounded-lg border border-transparent hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500/70 group-hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-[#020202]">
        <header className="h-20 bg-black/40 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-100 tracking-tight">
            {navigation.find(n => location.pathname === n.href || (n.href !== '/admin' && location.pathname.startsWith(n.href)))?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-300">{user?.name}</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 ring-1 ring-blue-500/20 animate-pulse-glow">
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
