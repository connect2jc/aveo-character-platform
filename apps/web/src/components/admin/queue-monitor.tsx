'use client';

import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils';
import { VIDEO_STATUSES } from '@/lib/constants';

interface QueueMonitorProps {
  jobs: Video[];
}

export function QueueMonitor({ jobs }: QueueMonitorProps) {
  const queuedCount = jobs.filter((j) => j.status === 'queued').length;
  const processingCount = jobs.filter((j) =>
    ['generating_audio', 'generating_lipsync', 'compositing'].includes(j.status)
  ).length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{queuedCount}</p>
              <p className="text-sm text-gray-500">Queued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{processingCount}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const status = VIDEO_STATUSES[job.status];
              return (
                <div key={job.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    {job.status === 'ready' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : job.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : job.status === 'queued' ? (
                      <Clock className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(job.created_at)}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      job.status === 'ready'
                        ? 'success'
                        : job.status === 'failed'
                        ? 'error'
                        : 'secondary'
                    }
                  >
                    {status.label}
                  </Badge>
                </div>
              );
            })}
            {jobs.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No jobs in the queue
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
