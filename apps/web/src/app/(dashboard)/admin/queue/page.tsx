'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueMonitor } from '@/components/admin/queue-monitor';
import { useRequireAdmin } from '@/hooks/use-auth';
import { Video } from '@/types';

export default function AdminQueuePage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const [jobs] = useState<Video[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    // In production, fetch from API
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (authLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Monitor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor video generation pipeline jobs in real time.
          </p>
        </div>
        <Button variant="outline" onClick={refresh} isLoading={isRefreshing}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <QueueMonitor jobs={jobs} />
    </div>
  );
}
