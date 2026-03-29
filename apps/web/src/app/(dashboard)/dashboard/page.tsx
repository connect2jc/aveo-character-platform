'use client';

import Link from 'next/link';
import { Video, Users, CalendarDays, TrendingUp, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is what is happening with your content today.
          </p>
        </div>
        <Link href="/dashboard/characters/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Character
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Characters"
          value={0}
          change="Create your first character"
          icon={Users}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatsCard
          title="Videos This Month"
          value={user?.monthly_video_count || 0}
          change={`${user?.monthly_video_limit || 30} limit`}
          icon={Video}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatsCard
          title="Scheduled Posts"
          value={0}
          change="Set up your calendar"
          icon={CalendarDays}
          iconColor="text-orange-600 bg-orange-100"
        />
        <StatsCard
          title="Total Views"
          value="0"
          change="Publish to start tracking"
          icon={TrendingUp}
          iconColor="text-green-600 bg-green-100"
        />
      </div>

      {/* Usage + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No activity yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create a character and generate your first video to get started.
                </p>
                <Link href="/dashboard/characters/new">
                  <Button variant="outline" className="mt-4">
                    Create Character
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <UsageMeter
            title="Videos"
            used={user?.monthly_video_count || 0}
            limit={user?.monthly_video_limit || 30}
            unit="videos"
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/characters/new"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Users className="h-4 w-4 text-gray-400" />
                Create new character
              </Link>
              <Link
                href="/dashboard/videos"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Video className="h-4 w-4 text-gray-400" />
                View video library
              </Link>
              <Link
                href="/dashboard/publishing"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="h-4 w-4 text-gray-400" />
                Connect platforms
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
