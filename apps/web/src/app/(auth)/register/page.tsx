'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    company_name: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        company_name: data.company_name,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start your 14 day free trial</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            id="full_name"
            label="Full Name"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="company_name"
            label="Company Name (optional)"
            placeholder="Your company"
            autoComplete="organization"
            error={errors.company_name?.message}
            {...register('company_name')}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            id="confirm_password"
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </Link>
        </p>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
