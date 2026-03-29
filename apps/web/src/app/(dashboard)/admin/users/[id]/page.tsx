'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useRequireAdmin } from '@/hooks/use-auth';

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <Avatar name="User" size="lg" className="h-20 w-20 text-xl" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">User #{params.id}</h3>
            <Badge variant="success" className="mt-2">Active</Badge>
            <div className="mt-6 w-full space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Reset Password
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                Suspend Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">User ID</dt>
                  <dd className="text-sm font-mono text-gray-900">{params.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Subscription</dt>
                  <dd><Badge>Starter</Badge></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Videos Used</dt>
                  <dd className="text-sm text-gray-900">0 / 30</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Characters</dt>
                  <dd className="text-sm text-gray-900">0</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-sm text-gray-500">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
