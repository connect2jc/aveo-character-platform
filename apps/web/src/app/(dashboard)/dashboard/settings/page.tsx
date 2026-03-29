'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';

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

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

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
      // API call would go here
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={user?.full_name || 'User'} size="lg" />
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
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

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" form="password-form" isLoading={isSaving}>
            Change Password
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
