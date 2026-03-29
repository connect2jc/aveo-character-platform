'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  /* Users, */
  /* CreditCard, */
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRequireAdmin } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// Mock financial data
const monthlyPnL = {
  revenue: 9200,
  cogs: 3900,
  grossProfit: 5300,
  grossMargin: 57.6,
};

const costBreakdown = [
  { service: 'HeyGen', cost: 1200, percentage: 30.8, color: 'bg-indigo-500' },
  { service: 'ElevenLabs', cost: 850, percentage: 21.8, color: 'bg-purple-500' },
  { service: 'FAL (image gen)', cost: 620, percentage: 15.9, color: 'bg-pink-500' },
  { service: 'Claude API', cost: 480, percentage: 12.3, color: 'bg-blue-500' },
  { service: 'Compute (GPU)', cost: 450, percentage: 11.5, color: 'bg-orange-500' },
  { service: 'Other', cost: 300, percentage: 7.7, color: 'bg-gray-400' },
];

const topUsers = [
  { name: 'Alex Johnson', plan: 'Pro', revenue: 499, cogs: 180, margin: 63.9 },
  { name: 'Sarah Chen', plan: 'Growth', revenue: 199, cogs: 95, margin: 52.3 },
  { name: 'Mike Peters', plan: 'Pro', revenue: 499, cogs: 210, margin: 57.9 },
  { name: 'Lisa Wang', plan: 'Growth', revenue: 199, cogs: 72, margin: 63.8 },
  { name: 'John Smith', plan: 'Starter', revenue: 79, cogs: 45, margin: 43.0 },
  { name: 'Emma Davis', plan: 'Growth', revenue: 199, cogs: 88, margin: 55.8 },
  { name: 'Tom Wilson', plan: 'Starter', revenue: 79, cogs: 52, margin: 34.2 },
  { name: 'Amy Lee', plan: 'Pro', revenue: 499, cogs: 195, margin: 60.9 },
  { name: 'David Kim', plan: 'Growth', revenue: 199, cogs: 110, margin: 44.7 },
  { name: 'Rachel Green', plan: 'Growth', revenue: 199, cogs: 78, margin: 60.8 },
];

// Cost per video trend
const costTrend = [
  { month: 'Oct', cost: 3.20 },
  { month: 'Nov', cost: 2.90 },
  { month: 'Dec', cost: 2.60 },
  { month: 'Jan', cost: 2.45 },
  { month: 'Feb', cost: 2.30 },
  { month: 'Mar', cost: 2.15 },
];

export default function AdminFinancialsPage() {
  const { isLoading } = useRequireAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  if (isLoading) return null;

  const maxCost = Math.max(...costTrend.map(d => d.cost));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reporting</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revenue, costs, and financial metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize',
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {period}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue"
          value={`$${monthlyPnL.revenue.toLocaleString()}`}
          change="+8.2% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-600 bg-green-100"
        />
        <StatsCard
          title="COGS"
          value={`$${monthlyPnL.cogs.toLocaleString()}`}
          change="+5.4% from last month"
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-red-600 bg-red-100"
        />
        <StatsCard
          title="Gross Profit"
          value={`$${monthlyPnL.grossProfit.toLocaleString()}`}
          change="+10.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatsCard
          title="Gross Margin"
          value={`${monthlyPnL.grossMargin}%`}
          change="Target: 60%"
          changeType="neutral"
          icon={PieChart}
          iconColor="text-purple-600 bg-purple-100"
        />
      </div>

      {/* P&L Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            Monthly P&L Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue */}
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
              </div>
              <span className="text-lg font-bold text-green-700">${monthlyPnL.revenue.toLocaleString()}</span>
            </div>

            {/* COGS */}
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Total COGS</span>
              </div>
              <span className="text-lg font-bold text-red-700">(${ monthlyPnL.cogs.toLocaleString()})</span>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-200" />

            {/* Gross Profit */}
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">Gross Profit</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-700">${monthlyPnL.grossProfit.toLocaleString()}</span>
                <span className="ml-2 text-sm text-indigo-500">({monthlyPnL.grossMargin}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Service</CardTitle>
            <CardDescription>Where your COGS goes this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costBreakdown.map((item) => (
                <div key={item.service}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', item.color)} />
                      <span className="text-sm text-gray-700">{item.service}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">${item.cost.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', item.color)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Per Video Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Per Video Trend</CardTitle>
            <CardDescription>Average cost to produce one video</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Simple CSS Line Chart */}
            <div className="relative h-48 flex items-end gap-2">
              {/* Y axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400">
                <span>${maxCost.toFixed(2)}</span>
                <span>${(maxCost / 2).toFixed(2)}</span>
                <span>$0</span>
              </div>

              {/* Chart bars with line */}
              <div className="ml-12 flex flex-1 items-end gap-1">
                {costTrend.map((data, index) => {
                  const height = (data.cost / maxCost) * 100;
                  return (
                    <div key={data.month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium text-gray-700">${data.cost}</span>
                      <div className="w-full flex justify-center">
                        <div
                          className={cn(
                            'w-8 rounded-t-md transition-all duration-700',
                            index === costTrend.length - 1
                              ? 'bg-gradient-to-t from-green-500 to-green-400'
                              : 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                          )}
                          style={{ height: `${height * 1.4}px` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Cost per video decreased 32.8% over 6 months
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per User P&L Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Per User P&L (Top 10 by Revenue)</CardTitle>
              <CardDescription>Individual user profitability breakdown</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">COGS</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Gross Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topUsers.map((user, i) => {
                  const profit = user.revenue - user.cogs;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-3">
                        <Badge variant={user.plan === 'Pro' ? 'default' : user.plan === 'Growth' ? 'default' : 'secondary'}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">${user.revenue}</td>
                      <td className="px-6 py-3 text-right text-sm text-red-600">${user.cogs}</td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-green-600">${profit}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          user.margin >= 50
                            ? 'bg-green-100 text-green-700'
                            : user.margin >= 35
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        )}>
                          {user.margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                  <td className="px-6 py-3 text-sm text-gray-900">Total</td>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">
                    ${topUsers.reduce((s, u) => s + u.revenue, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-red-600">
                    ${topUsers.reduce((s, u) => s + u.cogs, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-green-600">
                    ${topUsers.reduce((s, u) => s + (u.revenue - u.cogs), 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {(
                        (topUsers.reduce((s, u) => s + (u.revenue - u.cogs), 0) /
                         topUsers.reduce((s, u) => s + u.revenue, 0)) * 100
                      ).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { plan: 'Pro', revenue: 2994, users: 6, color: 'bg-purple-500' },
                { plan: 'Growth', revenue: 3980, users: 20, color: 'bg-indigo-500' },
                { plan: 'Starter', revenue: 2226, users: 28, color: 'bg-blue-400' },
              ].map((item) => {
                const pct = Math.round((item.revenue / monthlyPnL.revenue) * 100);
                return (
                  <div key={item.plan}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-3 w-3 rounded-full', item.color)} />
                        <span className="text-sm text-gray-700">{item.plan}</span>
                        <span className="text-xs text-gray-400">({item.users} users)</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">${item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', item.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
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
                { plan: 'Starter', count: 28, color: 'bg-blue-400', total: 54 },
                { plan: 'Growth', count: 20, color: 'bg-indigo-500', total: 54 },
                { plan: 'Pro', count: 6, color: 'bg-purple-500', total: 54 },
              ].map(({ plan, count, color, total }) => (
                <div key={plan}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', color)} />
                      <span className="text-gray-700">{plan}</span>
                    </div>
                    <span className="text-gray-500">{count} users ({Math.round(count/total*100)}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', color)}
                      style={{ width: `${(count/total)*100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
