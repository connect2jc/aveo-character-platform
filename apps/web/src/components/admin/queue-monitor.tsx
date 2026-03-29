'use client';

import { useState } from 'react';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCw,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils';
import { VIDEO_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface QueueMonitorProps {
  jobs: Video[];
  onRetry?: (jobId: string) => void;
}

export function QueueMonitor({ jobs, onRetry }: QueueMonitorProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const queuedCount = jobs.filter((j) => j.status === 'queued').length;
  const processingCount = jobs.filter((j) =>
    ['generating_audio', 'generating_lipsync', 'compositing'].includes(j.status)
  ).length;
  const completedCount = jobs.filter((j) => j.status === 'ready').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  const failedJobs = jobs.filter((j) => j.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{queuedCount}</p>
              <p className="text-sm text-gray-500">Queued</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="flex items-center gap-3 p-4">
            <Loader2 className={cn('h-8 w-8 text-indigo-500', processingCount > 0 && 'animate-spin')} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{processingCount}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failed Jobs (highlighted if any) */}
      {failedJobs.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Failed Jobs ({failedJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-red-100">
              {failedJobs.map((job) => (
                <div key={job.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(job.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onRetry && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRetry(job.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                          Retry
                        </Button>
                      )}
                      <button
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-100"
                      >
                        {expandedJob === job.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {expandedJob === job.id && job.error_message && (
                    <div className="mt-3 rounded-lg bg-red-100/50 p-3">
                      <p className="text-xs font-mono text-red-700">{job.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Pipeline Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline Jobs</CardTitle>
            <Badge variant="secondary">{jobs.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const status = VIDEO_STATUSES[job.status];
              const progress = job.pipeline_metadata?.progress;

              return (
                <div key={job.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(job.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Progress indicator for processing jobs */}
                    {progress !== undefined && progress > 0 && progress < 100 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{progress}%</span>
                      </div>
                    )}
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
                </div>
              );
            })}
            {jobs.length === 0 && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Clock className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No jobs in the queue</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pipeline jobs will appear here when videos are being generated.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
