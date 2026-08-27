import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Shield, Palette, AlertTriangle, Monitor, Sun, Moon, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(20, 'New password must be at most 20 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Tab = 'profile' | 'appearance' | 'security' | 'danger';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // OTP State
  const [otpStep, setOtpStep] = useState<'idle' | 'sent'>('idle');
  const [pendingEmail, setPendingEmail] = useState('');

  // Forms
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' }
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.email || '' }
  });

  const otpForm = useForm({ resolver: zodResolver(otpSchema) });
  
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: any) => {
    // Mock API Call
    toast.success('Profile updated successfully');
    if (user) updateUser({ ...user, name: data.name });
  };

  const onEmailSubmit = async (data: any) => {
    // Mock Send OTP
    if (data.email === user?.email) {
      toast.error('This is already your email address');
      return;
    }
    setPendingEmail(data.email);
    setOtpStep('sent');
    toast.success(`OTP sent to ${data.email}`);
  };

  const onOtpSubmit = async (data: any) => {
    // Mock Verify OTP
    if (data.otp === '123456') { // Mock correct OTP
      toast.success('Email updated successfully!');
      if (user) updateUser({ ...user, email: pendingEmail });
      setOtpStep('idle');
      emailForm.reset({ email: pendingEmail });
      otpForm.reset();
    } else {
      toast.error('Invalid OTP. Please try again. (Hint: use 123456 for demo)');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    toast.success('Password changed successfully');
    passwordForm.reset();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: This will permanently delete your account and all shortened URLs. Are you absolutely sure?')) {
      // Mock Delete Account
      toast.success('Account deleted');
      logout();
    }
  };

  const handleGoogleConnect = () => {
    toast.error('Google account linking requires backend OAuth2 integration');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* Profile Details */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Public Profile</h2>
                  <p className="text-sm text-muted-foreground">This information will be displayed on your account.</p>
                </div>
                <div className="p-6">
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Username / Full Name</label>
                      <Input 
                        {...profileForm.register('name')} 
                        error={profileForm.formState.errors.name?.message as string} 
                      />
                    </div>
                    <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
                      Save Changes
                    </Button>
                  </form>
                </div>
              </div>

              {/* Email Update with OTP flow */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Email Address</h2>
                  <p className="text-sm text-muted-foreground">Changing your email requires OTP verification.</p>
                </div>
                <div className="p-6">
                  {otpStep === 'idle' ? (
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Current Email</label>
                        <Input disabled value={user?.email || ''} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">New Email</label>
                        <Input 
                          {...emailForm.register('email')} 
                          error={emailForm.formState.errors.email?.message as string} 
                        />
                      </div>
                      <Button type="submit" isLoading={emailForm.formState.isSubmitting}>
                        Send Verification Code
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4 max-w-md">
                      <div className="bg-primary/10 p-4 rounded-lg flex gap-3 items-start border border-primary/20">
                        <CheckCircle2 className="text-primary mt-0.5" size={18} />
                        <div>
                          <p className="text-sm font-medium text-primary">Verification code sent</p>
                          <p className="text-xs text-primary/80 mt-1">We've sent a 6-digit code to {pendingEmail}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium text-foreground">Enter 6-digit OTP</label>
                        <Input 
                          placeholder="123456" 
                          maxLength={6}
                          {...otpForm.register('otp')} 
                          error={otpForm.formState.errors.otp?.message as string} 
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" isLoading={otpForm.formState.isSubmitting}>
                          Verify & Update Email
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setOtpStep('idle')}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Theme Preferences</h2>
                  <p className="text-sm text-muted-foreground">Customize how ClickMe looks on your device.</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Sun className="mb-3 text-amber-500" size={24} />
                      <div className="font-semibold text-foreground">Light</div>
                      <div className="text-xs text-muted-foreground mt-1">Clean and bright</div>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Moon className="mb-3 text-indigo-500" size={24} />
                      <div className="font-semibold text-foreground">Dark</div>
                      <div className="text-xs text-muted-foreground mt-1">Easy on the eyes</div>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Monitor className="mb-3 text-slate-500" size={24} />
                      <div className="font-semibold text-foreground">System</div>
                      <div className="text-xs text-muted-foreground mt-1">Follows OS settings</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                  <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Current Password</label>
                      <Input type="password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message as string} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <Input type="password" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message as string} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                      <Input type="password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message as string} />
                    </div>
                    <Button type="submit" isLoading={passwordForm.formState.isSubmitting}>
                      Update Password
                    </Button>
                  </form>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
                    <p className="text-sm text-muted-foreground">Link external accounts to log in faster.</p>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-accent flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGoogleConnect}>Connect</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-destructive/20">
                  <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Danger Zone
                  </h2>
                  <p className="text-sm text-destructive/80 mt-1">Irreversible and destructive actions.</p>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-destructive/10">
                    <div>
                      <h3 className="font-medium text-foreground">Sign out all other sessions</h3>
                      <p className="text-sm text-muted-foreground mt-1">Log out of all devices except this one.</p>
                    </div>
                    <Button variant="outline" onClick={() => toast.error('Session management requires backend support')} className="whitespace-nowrap">
                      Sign out sessions
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-medium text-foreground">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all associated URLs.</p>
                    </div>
                    <Button variant="danger" onClick={handleDeleteAccount} className="whitespace-nowrap">
                      Delete Account
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
