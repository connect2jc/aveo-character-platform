'use client';

import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Video } from '@/types';
import { formatDuration, formatDate } from '@/lib/utils';
import { VIDEO_STATUSES } from '@/lib/constants';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const status = VIDEO_STATUSES[video.status];

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[9/16] max-h-[280px] bg-gray-100">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {video.status === 'ready' && (
          <Link
            href={`/dashboard/videos/${video.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-5 w-5 text-gray-900 ml-0.5" />
            </div>
          </Link>
        )}
        <div className="absolute left-2 top-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.color}`}>
            {status.label}
          </span>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <Link
          href={`/dashboard/videos/${video.id}`}
          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
        >
          {video.title}
        </Link>
        <p className="mt-1 text-xs text-gray-500">{formatDate(video.created_at)}</p>
      </CardContent>
    </Card>
  );
}
