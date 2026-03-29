'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/videos/video-player';
import { PipelineStatus } from '@/components/videos/pipeline-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideo } from '@/hooks/use-videos';
import { formatDate, formatDuration } from '@/lib/utils';
import { VIDEO_STATUSES } from '@/lib/constants';

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const { video, isLoading } = useVideo(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="aspect-[9/16] lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">Video not found</h2>
        <Link href="/dashboard/videos">
          <Button variant="outline" className="mt-4">Back to Videos</Button>
        </Link>
      </div>
    );
  }

  const status = VIDEO_STATUSES[video.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/videos" className="rounded-lg p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
              <Badge
                variant={
                  video.status === 'ready' ? 'success' : video.status === 'failed' ? 'error' : 'secondary'
                }
              >
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(video.created_at)}
              {video.duration && ` / ${formatDuration(video.duration)}`}
            </p>
          </div>
        </div>
        {video.status === 'ready' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {video.video_url ? (
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url}
              className="aspect-[9/16] w-full"
            />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-xl bg-gray-100">
              <p className="text-sm text-gray-400">Video not available</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineStatus video={video} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Resolution</dt>
                  <dd className="text-sm font-medium text-gray-900">{video.resolution}</dd>
                </div>
                {video.duration && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Duration</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDuration(video.duration)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(video.created_at)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
