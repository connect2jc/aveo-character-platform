'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Bell,
  Camera,
  Key,
  Mail,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  company_name: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'video_ready', label: 'Video Ready', description: 'Get notified when your video is done generating', enabled: true },
    { id: 'video_failed', label: 'Video Failed', description: 'Get notified when a video generation fails', enabled: true },
    { id: 'weekly_report', label: 'Weekly Report', description: 'Receive a weekly summary of your content performance', enabled: false },
    { id: 'marketing', label: 'Product Updates', description: 'News about new features and improvements', enabled: false },
    { id: 'usage_alerts', label: 'Usage Alerts', description: 'Get warned when approaching plan limits', enabled: true },
  ]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      company_name: user?.company_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      console.log('Update profile:', data);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      console.log('Change password:', data);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-500" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Avatar Upload */}
          <div className="mb-6 flex items-center gap-5">
            <div className="relative">
              <Avatar name={user?.full_name || 'User'} size="lg" className="h-20 w-20 text-xl" />
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition-transform hover:scale-110">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700">
                Upload Photo
              </Button>
            </div>
          </div>

          <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              error={profileForm.formState.errors.full_name?.message}
              {...profileForm.register('full_name')}
            />
            <Input
              label="Email"
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
            <Input
              label="Company Name"
              error={profileForm.formState.errors.company_name?.message}
              {...profileForm.register('company_name')}
            />
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="profile-form" isLoading={isSaving}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-500" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              error={passwordForm.formState.errors.current_password?.message}
              {...passwordForm.register('current_password')}
            />
            <Input
              label="New Password"
              type="password"
              error={passwordForm.formState.errors.new_password?.message}
              {...passwordForm.register('new_password')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              error={passwordForm.formState.errors.confirm_password?.message}
              {...passwordForm.register('confirm_password')}
            />
          </form>

          {/* Password Strength Hints */}
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
            <ul className="space-y-1">
              {[
                'At least 8 characters',
                'One uppercase letter',
                'One number',
              ].map((req) => (
                <li key={req} className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="password-form" isLoading={isSaving}>
            Change Password
          </Button>
        </CardFooter>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what email notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.label}</p>
                    <p className="text-xs text-gray-500">{notification.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(notification.id)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    notification.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      notification.enabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This will permanently delete your account, all characters, videos, scripts, and billing data. This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="Type DELETE here"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setDeleteDialogOpen(false);
            setDeleteConfirmText('');
          }}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleteConfirmText !== 'DELETE'}
            onClick={() => {
              toast.success('Account deletion request submitted');
              setDeleteDialogOpen(false);
              setDeleteConfirmText('');
            }}
          >
            Delete My Account
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
