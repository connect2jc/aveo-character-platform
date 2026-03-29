'use client';

import Link from 'next/link';
import {
  Users,
  ListChecks,
  DollarSign,
  ArrowUpRight,
  UserPlus,
  Activity,
} from 'lucide-react';
import { AdminStats } from '@/components/admin/admin-stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useRequireAdmin } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Mock data for demo
const recentSignups = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', plan: 'Growth', date: '2 hours ago' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Starter', date: '5 hours ago' },
  { id: '3', name: 'Mike Peters', email: 'mike@example.com', plan: 'Pro', date: '1 day ago' },
  { id: '4', name: 'Lisa Wang', email: 'lisa@example.com', plan: 'Growth', date: '2 days ago' },
];

const pipelineSummary = [
  { label: 'Active', count: 0, color: 'bg-blue-500' },
  { label: 'Queued', count: 0, color: 'bg-yellow-500' },
  { label: 'Completed Today', count: 0, color: 'bg-green-500' },
  { label: 'Failed Today', count: 0, color: 'bg-red-500' },
];

// Mock revenue vs COGS data
const chartData = [
  { month: 'Oct', revenue: 2400, cogs: 1200 },
  { month: 'Nov', revenue: 3800, cogs: 1800 },
  { month: 'Dec', revenue: 5200, cogs: 2400 },
  { month: 'Jan', revenue: 7100, cogs: 3100 },
  { month: 'Feb', revenue: 8400, cogs: 3600 },
  { month: 'Mar', revenue: 9200, cogs: 3900 },
];

export default function AdminDashboardPage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return null;

  const maxValue = Math.max(...chartData.map(d => Math.max(d.revenue, d.cogs)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and management.
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStats
        totalUsers={156}
        activeUsers={89}
        totalVideos={1247}
        monthlyRevenue={9200}
        cogsThisMonth={3900}
      />

      {/* Revenue vs COGS Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue vs COGS</CardTitle>
              <CardDescription>Monthly comparison of revenue and costs</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-pink-400" />
                <span className="text-xs text-gray-500">COGS</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {chartData.map((data) => {
              const revenueHeight = (data.revenue / maxValue) * 100;
              const cogsHeight = (data.cogs / maxValue) * 100;
              return (
                <div key={data.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-1 h-40">
                    <div
                      className="w-5 rounded-t-md bg-indigo-500 transition-all duration-700 hover:bg-indigo-600"
                      style={{ height: `${revenueHeight}%` }}
                      title={`Revenue: $${data.revenue.toLocaleString()}`}
                    />
                    <div
                      className="w-5 rounded-t-md bg-pink-400 transition-all duration-700 hover:bg-pink-500"
                      style={{ height: `${cogsHeight}%` }}
                      title={`COGS: $${data.cogs.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-500" />
                Recent Signups
              </CardTitle>
              <Link href="/admin/users" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentSignups.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-xs">{user.plan}</Badge>
                    <span className="text-xs text-gray-400">{user.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Pipeline Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Pipeline Summary
              </CardTitle>
              <Link href="/admin/queue" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View Queue
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {pipelineSummary.map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-blue-100 p-3 transition-transform duration-200 group-hover:scale-110">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">User Management</CardTitle>
                <p className="mt-1 text-sm text-gray-500">View and manage users</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-indigo-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/queue">
          <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-purple-100 p-3 transition-transform duration-200 group-hover:scale-110">
                <ListChecks className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pipeline Monitor</CardTitle>
                <p className="mt-1 text-sm text-gray-500">View processing queue</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-indigo-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/financials">
          <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-green-100 p-3 transition-transform duration-200 group-hover:scale-110">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Financial Reports</CardTitle>
                <p className="mt-1 text-sm text-gray-500">Revenue and billing data</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-300 transition-colors group-hover:text-indigo-500" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
