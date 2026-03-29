'use client';

import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequireAdmin } from '@/hooks/use-auth';

export default function AdminFinancialsPage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reporting</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revenue, subscriptions, and financial metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="MRR"
          value="$0"
          change="Monthly recurring revenue"
          icon={DollarSign}
          iconColor="text-green-600 bg-green-100"
        />
        <StatsCard
          title="ARR"
          value="$0"
          change="Annual recurring revenue"
          icon={TrendingUp}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatsCard
          title="Paying Customers"
          value={0}
          change="Active subscriptions"
          icon={Users}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatsCard
          title="Avg Revenue Per User"
          value="$0"
          change="ARPU this month"
          icon={CreditCard}
          iconColor="text-orange-600 bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Starter', 'Growth', 'Pro'].map((plan) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-gray-700">{plan}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">$0</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { plan: 'Starter', count: 0, color: 'bg-blue-500' },
                { plan: 'Growth', count: 0, color: 'bg-indigo-500' },
                { plan: 'Pro', count: 0, color: 'bg-purple-500' },
              ].map(({ plan, count, color }) => (
                <div key={plan}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700">{plan}</span>
                    <span className="text-gray-500">{count} users</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
