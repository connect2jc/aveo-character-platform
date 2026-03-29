'use client';

import { Users, Video, DollarSign, TrendingDown } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';

interface AdminStatsProps {
  totalUsers: number;
  activeUsers: number;
  totalVideos: number;
  monthlyRevenue: number;
  cogsThisMonth?: number;
}

export function AdminStats({ totalUsers, activeUsers, totalVideos, monthlyRevenue, cogsThisMonth = 0 }: AdminStatsProps) {
  const grossMargin = monthlyRevenue > 0
    ? Math.round(((monthlyRevenue - cogsThisMonth) / monthlyRevenue) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        change={`${activeUsers} active`}
        changeType="neutral"
        icon={Users}
        iconColor="text-blue-600 bg-blue-100"
      />
      <StatsCard
        title="MRR"
        value={`$${monthlyRevenue.toLocaleString()}`}
        change="+8% from last month"
        changeType="positive"
        icon={DollarSign}
        iconColor="text-green-600 bg-green-100"
      />
      <StatsCard
        title="Total Videos"
        value={totalVideos.toLocaleString()}
        change="+12% this month"
        changeType="positive"
        icon={Video}
        iconColor="text-purple-600 bg-purple-100"
      />
      <StatsCard
        title="COGS This Month"
        value={`$${cogsThisMonth.toLocaleString()}`}
        change={`${grossMargin}% gross margin`}
        changeType={grossMargin >= 50 ? 'positive' : 'negative'}
        icon={TrendingDown}
        iconColor="text-orange-600 bg-orange-100"
      />
    </div>
  );
}
