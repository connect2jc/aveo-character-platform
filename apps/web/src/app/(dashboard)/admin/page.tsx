'use client';

import Link from 'next/link';
import { Users, ListChecks, DollarSign } from 'lucide-react';
import { AdminStats } from '@/components/admin/admin-stats';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useRequireAdmin } from '@/hooks/use-auth';

export default function AdminDashboardPage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and management.
        </p>
      </div>

      <AdminStats
        totalUsers={0}
        activeUsers={0}
        totalVideos={0}
        monthlyRevenue={0}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">User Management</CardTitle>
                <p className="mt-1 text-sm text-gray-500">View and manage users</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/queue">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-purple-100 p-3">
                <ListChecks className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pipeline Monitor</CardTitle>
                <p className="mt-1 text-sm text-gray-500">View processing queue</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/financials">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Financial Reports</CardTitle>
                <p className="mt-1 text-sm text-gray-500">Revenue and billing data</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
