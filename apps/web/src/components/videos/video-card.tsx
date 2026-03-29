'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Video } from '@/types';
import { formatDuration, formatDate, cn } from '@/lib/utils';
import { VIDEO_STATUSES } from '@/lib/constants';

interface VideoCardProps {
  video: Video;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDownload?: (video: Video) => void;
  onApprove?: (video: Video) => void;
  onReject?: (video: Video) => void;
  characterName?: string;
}

export function VideoCard({
  video,
  selectable,
  selected,
  onSelect,
  onDownload,
  onApprove,
  onReject,
  characterName,
}: VideoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const status = VIDEO_STATUSES[video.status];

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all hover:shadow-md',
        selected && 'ring-2 ring-indigo-400',
        selectable && 'cursor-pointer'
      )}
      onClick={() => selectable && onSelect?.(video.id)}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[9/16] max-h-[280px] bg-gray-100"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Play className="h-12 w-12 text-gray-300" />
            {video.status !== 'ready' && video.status !== 'failed' && (
              <div className="mx-4 w-3/4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${video.pipeline_metadata?.progress || 0}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-center text-[10px] text-gray-400">
                  {video.pipeline_metadata?.progress || 0}% complete
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hover overlay with play button */}
        {video.status === 'ready' && (
          <Link
            href={`/dashboard/videos/${video.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 h-5 w-5 text-gray-900" />
            </div>
          </Link>
        )}

        {/* Status badge */}
        <div className="absolute left-2 top-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white',
              status.color
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Selectable checkbox */}
        {selectable && (
          <div className="absolute right-2 top-2">
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                selected
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-white/60 bg-white/20'
              )}
            >
              {selected && (
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Quick actions on hover */}
        {showActions && (video.status === 'ready') && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            {onDownload && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload(video);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            {onApprove && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onApprove(video);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600/80 text-white transition-colors hover:bg-green-600"
                title="Approve"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
            )}
            {onReject && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReject(video);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/80 text-white transition-colors hover:bg-red-600"
                title="Reject"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card content */}
      <CardContent className="p-3">
        <Link
          href={`/dashboard/videos/${video.id}`}
          className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-indigo-600"
          onClick={(e) => e.stopPropagation()}
        >
          {video.title}
        </Link>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {characterName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {characterName}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(video.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
