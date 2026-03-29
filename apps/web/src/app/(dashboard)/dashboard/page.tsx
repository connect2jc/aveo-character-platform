'use client';

import Link from 'next/link';
import {
  Video,
  Users,
  CalendarDays,
  Plus,
  FileText,
  Clock,
  ArrowUpRight,
  Zap,
  PlayCircle,
  BarChart3,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';

const recentActivity = [
  {
    id: '1',
    type: 'video',
    title: 'Video "5 Money Habits" completed',
    time: '2 hours ago',
    icon: PlayCircle,
    iconColor: 'text-green-500 bg-green-500/10',
  },
  {
    id: '2',
    type: 'script',
    title: 'Script generated for "Morning Routine Tips"',
    time: '4 hours ago',
    icon: FileText,
    iconColor: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: '3',
    type: 'publish',
    title: 'Published to TikTok and YouTube Shorts',
    time: '6 hours ago',
    icon: ArrowUpRight,
    iconColor: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: '4',
    type: 'character',
    title: 'Character "Coach Alex" updated',
    time: '1 day ago',
    icon: Users,
    iconColor: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: '5',
    type: 'analytics',
    title: 'Weekly analytics report ready',
    time: '2 days ago',
    icon: BarChart3,
    iconColor: 'text-indigo-500 bg-indigo-500/10',
  },
];

const quickActions = [
  {
    label: 'Create Character',
    description: 'Design a new AI character',
    href: '/dashboard/characters/new',
    icon: Users,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 hover:border-purple-500/50',
  },
  {
    label: 'Generate Calendar',
    description: 'Plan your content schedule',
    href: '/dashboard/characters',
    icon: CalendarDays,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-500/50',
  },
  {
    label: 'View Videos',
    description: 'Browse your video library',
    href: '/dashboard/videos',
    icon: Video,
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/50',
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const hasActivity = user && (user.monthly_video_count > 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is an overview of your content production.
          </p>
        </div>
        <Link href="/dashboard/characters/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Character
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Characters"
          value={0}
          change="Create your first character"
          icon={Users}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatsCard
          title="Videos This Month"
          value={user?.monthly_video_count || 0}
          change={`of ${user?.monthly_video_limit || 30} limit`}
          icon={Video}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatsCard
          title="Scripts Generated"
          value={0}
          change="Generate from your calendar"
          icon={FileText}
          iconColor="text-orange-600 bg-orange-100"
        />
        <StatsCard
          title="Publishing Queue"
          value={0}
          change="No videos pending"
          icon={Clock}
          iconColor="text-green-600 bg-green-100"
        />
      </div>

      {/* Usage Meter + Quick Actions Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Usage Meter */}
        <div>
          <UsageMeter
            title="Video Usage This Month"
            used={user?.monthly_video_count || 0}
            limit={user?.monthly_video_limit || 30}
            unit="videos"
          />

          {/* Plan Info */}
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Current Plan</p>
                  <p className="mt-1 text-lg font-bold capitalize text-gray-900">
                    {user?.subscription_tier || 'Starter'}
                  </p>
                </div>
                <Badge variant={user?.subscription_status === 'active' ? 'success' : 'default'}>
                  {user?.subscription_status === 'trialing' ? 'Trial' : user?.subscription_status || 'Active'}
                </Badge>
              </div>
              <Link
                href="/dashboard/billing"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage subscription
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <div
                  className={`group flex flex-col items-center gap-3 rounded-xl border bg-gradient-to-br p-6 text-center transition-all duration-300 ${action.color}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <action.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Link
                href="/dashboard/videos"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {hasActivity ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${activity.iconColor}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <Zap className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">No activity yet</h3>
                  <p className="mt-1 max-w-xs text-sm text-gray-500">
                    Create a character and generate your first video to see your activity feed here.
                  </p>
                  <Link href="/dashboard/characters/new">
                    <Button variant="outline" className="mt-4" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Character Cards (empty state) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Your Characters</h2>
          <Link
            href="/dashboard/characters"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Empty state card */}
          <Link href="/dashboard/characters/new">
            <div className="group flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-indigo-500" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-600 group-hover:text-indigo-600">
                Create your first character
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Set up a character to start producing videos
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
