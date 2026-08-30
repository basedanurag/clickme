import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyUrls from './pages/MyUrls';
import CreateUrl from './pages/CreateUrl';
import Analytics from './pages/Analytics';
import QrCode from './pages/QrCode';
import Settings from './pages/Settings';
import OAuth2Callback from './pages/OAuth2Callback';
import AdminLogin from './pages/AdminLogin';

// Admin Imports
import { AdminRoute } from './components/layout/AdminRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminUserDetails } from './pages/admin/AdminUserDetails';
import { AdminUrls } from './pages/admin/AdminUrls';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/oauth2/callback" element={<PublicRoute><OAuth2Callback /></PublicRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/urls" element={<ProtectedRoute><MyUrls /></ProtectedRoute>} />
      <Route path="/urls/new" element={<ProtectedRoute><CreateUrl /></ProtectedRoute>} />
      <Route path="/urls/:id/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/urls/:id/qr" element={<ProtectedRoute><QrCode /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetails />} />
          <Route path="/admin/urls" element={<AdminUrls />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="clickme-theme">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-700',
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
