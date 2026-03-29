'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueueMonitor } from '@/components/admin/queue-monitor';
import { useRequireAdmin } from '@/hooks/use-auth';
import { Video } from '@/types';
import { cn } from '@/lib/utils';

type QueueFilter = 'all' | 'audio' | 'clips' | 'stitching' | 'scripts';

export default function AdminQueuePage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const [jobs] = useState<Video[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const refresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }, 500);
  };

  if (authLoading) return null;

  // Queue stats
  const queueStats = {
    audio: { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 },
    clips: { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 },
    stitching: { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 },
    scripts: { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 },
  };

  const totalStats = {
    active: Object.values(queueStats).reduce((sum, q) => sum + q.active, 0),
    waiting: Object.values(queueStats).reduce((sum, q) => sum + q.waiting, 0),
    completed: Object.values(queueStats).reduce((sum, q) => sum + q.completed, 0),
    failed: Object.values(queueStats).reduce((sum, q) => sum + q.failed, 0),
    delayed: Object.values(queueStats).reduce((sum, q) => sum + q.delayed, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Monitor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor video generation pipeline jobs in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </span>
          <Button variant="outline" onClick={refresh} isLoading={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* BullMQ Stats Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Active', value: totalStats.active, color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
          { label: 'Waiting', value: totalStats.waiting, color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
          { label: 'Completed', value: totalStats.completed, color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
          { label: 'Failed', value: totalStats.failed, color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
          { label: 'Delayed', value: totalStats.delayed, color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-xl p-4', stat.bgColor)}>
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', stat.color)} />
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className={cn('mt-2 text-3xl font-bold', stat.textColor)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Per Queue Breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(queueStats) as [string, typeof queueStats.audio][]).map(([name, stats]) => (
          <div key={name} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 capitalize">{name}</h3>
              {stats.failed > 0 && (
                <Badge variant="error" className="text-xs">{stats.failed} failed</Badge>
              )}
            </div>
            <div className="space-y-2">
              {[
                { label: 'Active', value: stats.active, color: 'bg-blue-500' },
                { label: 'Waiting', value: stats.waiting, color: 'bg-yellow-500' },
                { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-1.5 w-1.5 rounded-full', item.color)} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
        {(['all', 'audio', 'clips', 'stitching', 'scripts'] as QueueFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setQueueFilter(filter)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              queueFilter === filter
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <span className="capitalize">{filter === 'all' ? 'All Queues' : filter}</span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <QueueMonitor jobs={jobs} />
    </div>
  );
}
