'use client';

import { Users, Video, DollarSign, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';

interface AdminStatsProps {
  totalUsers: number;
  activeUsers: number;
  totalVideos: number;
  monthlyRevenue: number;
}

export function AdminStats({ totalUsers, activeUsers, totalVideos, monthlyRevenue }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={totalUsers}
        change={`${activeUsers} active`}
        changeType="neutral"
        icon={Users}
        iconColor="text-blue-600 bg-blue-100"
      />
      <StatsCard
        title="Total Videos"
        value={totalVideos}
        change="+12% this month"
        changeType="positive"
        icon={Video}
        iconColor="text-purple-600 bg-purple-100"
      />
      <StatsCard
        title="Monthly Revenue"
        value={`$${monthlyRevenue.toLocaleString()}`}
        change="+8% from last month"
        changeType="positive"
        icon={DollarSign}
        iconColor="text-green-600 bg-green-100"
      />
      <StatsCard
        title="System Health"
        value="99.9%"
        change="All systems operational"
        changeType="positive"
        icon={Activity}
        iconColor="text-emerald-600 bg-emerald-100"
      />
    </div>
  );
}
