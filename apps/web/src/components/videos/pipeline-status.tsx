'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Volume2,
  Film,
  Layers,
  Eye,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Video } from '@/types';
import { Button } from '@/components/ui/button';
import { cn, formatDuration } from '@/lib/utils';

interface PipelineStatusProps {
  video: Video;
  onRetry?: (step: string) => void;
  expanded?: boolean;
}

interface PipelineStep {
  key: string;
  label: string;
  icon: typeof FileText;
  description: string;
}

const pipelineSteps: PipelineStep[] = [
  {
    key: 'queued',
    label: 'Script',
    icon: FileText,
    description: 'Script prepared and queued for production',
  },
  {
    key: 'generating_audio',
    label: 'Audio',
    icon: Volume2,
    description: 'Generating voice audio from script',
  },
  {
    key: 'generating_lipsync',
    label: 'Lip Sync',
    icon: Film,
    description: 'Creating lip sync animation from audio',
  },
  {
    key: 'compositing',
    label: 'Stitch',
    icon: Layers,
    description: 'Compositing clips, overlays, and transitions',
  },
  {
    key: 'ready',
    label: 'Review',
    icon: Eye,
    description: 'Video is ready for quality review',
  },
  {
    key: 'published',
    label: 'Published',
    icon: Globe,
    description: 'Video published to selected platforms',
  },
];

export function PipelineStatus({ video, onRetry, expanded = false }: PipelineStatusProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const currentIndex = pipelineSteps.findIndex((s) => s.key === video.status);
  const isFailed = video.status === 'failed';

  // Calculate elapsed time
  const startedAt = video.pipeline_metadata?.started_at;
  const completedAt = video.pipeline_metadata?.completed_at;
  let elapsedStr = '';
  if (startedAt) {
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const elapsed = Math.floor((end - start) / 1000);
    elapsedStr = formatDuration(elapsed);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">
          Pipeline Progress
        </h4>
        <div className="flex items-center gap-2">
          {elapsedStr && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {elapsedStr}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200">
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-700',
              isFailed ? 'bg-red-500' : 'bg-indigo-500'
            )}
            style={{
              width: `${Math.max(
                0,
                (currentIndex / (pipelineSteps.length - 1)) * 100
              )}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {pipelineSteps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center"
                style={{ width: `${100 / pipelineSteps.length}%` }}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all',
                    isComplete && 'border-green-500 bg-green-50',
                    isCurrent && !isFailed && 'border-indigo-500 bg-indigo-50',
                    isCurrent && isFailed && 'border-red-500 bg-red-50',
                    !isComplete && !isCurrent && 'border-gray-200'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isCurrent && !isFailed ? (
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  ) : isCurrent && isFailed ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-300" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-center text-[11px] font-medium',
                    isComplete && 'text-green-700',
                    isCurrent && !isFailed && 'text-indigo-700',
                    isCurrent && isFailed && 'text-red-700',
                    !isComplete && !isCurrent && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      {video.pipeline_metadata?.progress !== undefined && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {video.pipeline_metadata.current_step || 'Processing'}
            </span>
            <span className="font-medium text-gray-700">
              {video.pipeline_metadata.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isFailed ? 'bg-red-500' : 'bg-indigo-600'
              )}
              style={{ width: `${video.pipeline_metadata.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {isFailed && video.error_message && (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Pipeline failed
              </p>
              <p className="mt-1 text-sm text-red-600">
                {video.error_message}
              </p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs text-red-600 hover:bg-red-100"
                  onClick={() =>
                    onRetry(video.pipeline_metadata?.current_step || video.status)
                  }
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Retry from this step
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded step details */}
      {isExpanded && (
        <div className="space-y-2 border-t border-gray-100 pt-4">
          {pipelineSteps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.key}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2',
                  isCurrent && !isFailed && 'bg-indigo-50',
                  isCurrent && isFailed && 'bg-red-50',
                  isComplete && 'bg-green-50/50'
                )}
              >
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : isCurrent && !isFailed ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : isCurrent && isFailed ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isComplete && 'text-green-700',
                      isCurrent && !isFailed && 'text-indigo-700',
                      isCurrent && isFailed && 'text-red-700',
                      !isComplete && !isCurrent && 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {isComplete && (
                  <span className="text-xs text-green-500">Done</span>
                )}
                {isCurrent && !isFailed && (
                  <span className="text-xs text-indigo-500">In progress</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
