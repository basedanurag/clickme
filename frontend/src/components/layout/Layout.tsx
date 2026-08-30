import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Link as LinkIcon, Settings, LogOut, Menu, X, Sun, Moon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', href: '/urls', icon: LinkIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
            <Link to="/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
              <LinkIcon className="h-6 w-6" />
              ClickMe
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <NavLinks />
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-border p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="inline-block h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="ml-auto p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button & top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-card border-b border-border">
        <Link to="/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
          <LinkIcon className="h-6 w-6" />
          ClickMe
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-0 bg-background pt-16">
          <div className="pt-2 pb-3 space-y-1 px-2 border-b border-border">
            <NavLinks />
          </div>
          <div className="pt-4 pb-3 border-border">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">{user?.name}</div>
                <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
