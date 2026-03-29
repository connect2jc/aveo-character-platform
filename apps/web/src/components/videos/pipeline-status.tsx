'use client';

import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { Video } from '@/types';
import { cn } from '@/lib/utils';

interface PipelineStatusProps {
  video: Video;
}

const pipelineSteps = [
  { key: 'queued', label: 'Queued' },
  { key: 'generating_audio', label: 'Audio Generation' },
  { key: 'generating_lipsync', label: 'Lip Sync' },
  { key: 'compositing', label: 'Compositing' },
  { key: 'ready', label: 'Ready' },
];

export function PipelineStatus({ video }: PipelineStatusProps) {
  const currentIndex = pipelineSteps.findIndex((s) => s.key === video.status);
  const isFailed = video.status === 'failed';

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">Pipeline Progress</h4>
      <div className="space-y-3">
        {pipelineSteps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isCurrent && !isFailed ? (
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              ) : isCurrent && isFailed ? (
                <Circle className="h-5 w-5 text-red-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
              <span
                className={cn(
                  'text-sm',
                  isComplete && 'text-green-700',
                  isCurrent && !isFailed && 'font-medium text-indigo-700',
                  isCurrent && isFailed && 'font-medium text-red-700',
                  !isComplete && !isCurrent && 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {isFailed && video.error_message && (
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">{video.error_message}</p>
        </div>
      )}
      {video.pipeline_metadata?.progress !== undefined && (
        <div className="mt-2">
          <div className="mb-1 text-xs text-gray-500">
            {video.pipeline_metadata.progress}% complete
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${video.pipeline_metadata.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
