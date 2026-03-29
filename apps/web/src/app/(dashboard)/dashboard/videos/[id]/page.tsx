'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Smartphone,
  Square,
  RectangleHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Globe,
  Send,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { VideoPlayer } from '@/components/videos/video-player';
import { PipelineStatus } from '@/components/videos/pipeline-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideo } from '@/hooks/use-videos';
import { formatDate, formatDuration, cn } from '@/lib/utils';
import { VIDEO_STATUSES, PLATFORMS } from '@/lib/constants';
import api from '@/lib/api';
import { ApiResponse, Script, VideoClip } from '@/types';

type AspectRatio = '9:16' | '1:1' | '4:5';

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const { video, isLoading, setVideo } = useVideo(params.id);
  const [script, setScript] = useState<Script | null>(null);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [expandedClips, setExpandedClips] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load script data
  useState(() => {
    if (video?.script_id) {
      api
        .get<ApiResponse<Script>>(`/api/v1/scripts/${video.script_id}`)
        .then(({ data }) => setScript(data.data))
        .catch(() => {});
    }
  });

  // Load clips
  useState(() => {
    if (video?.id) {
      api
        .get<ApiResponse<VideoClip[]>>(`/api/v1/videos/${video.id}/clips`)
        .then(({ data }) => setClips(data.data))
        .catch(() => {});
    }
  });

  const handleApprove = async () => {
    if (!video) return;
    setIsApproving(true);
    try {
      const { data } = await api.patch<ApiResponse<typeof video>>(
        `/api/v1/videos/${video.id}`,
        { status: 'ready' }
      );
      setVideo(data.data);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!video) return;
    setIsApproving(true);
    try {
      const { data } = await api.patch<ApiResponse<typeof video>>(
        `/api/v1/videos/${video.id}`,
        { status: 'failed', error_message: rejectNotes }
      );
      setVideo(data.data);
      setShowRejectDialog(false);
      setRejectNotes('');
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePublish = async () => {
    if (!video || !selectedPlatform) return;
    setIsPublishing(true);
    try {
      await api.post(`/api/v1/videos/${video.id}/publish`, {
        platform: selectedPlatform,
        scheduled_at: scheduleDate || undefined,
      });
      setShowPublishDialog(false);
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownload = (ratio: AspectRatio) => {
    if (!video?.video_url) return;
    const a = document.createElement('a');
    a.href = video.video_url;
    a.download = `${video.title}_${ratio}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRetryPipeline = async (step: string) => {
    if (!video) return;
    try {
      const { data } = await api.post<ApiResponse<typeof video>>(
        `/api/v1/videos/${video.id}/retry`,
        { from_step: step }
      );
      setVideo(data.data);
    } catch (err) {
      console.error('Failed to retry:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="aspect-[9/16] lg:col-span-1" />
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">Video not found</h2>
        <Link href="/dashboard/videos">
          <Button variant="outline" className="mt-4">
            Back to Videos
          </Button>
        </Link>
      </div>
    );
  }

  const status = VIDEO_STATUSES[video.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/videos"
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {video.title}
              </h1>
              <Badge
                variant={
                  video.status === 'ready'
                    ? 'success'
                    : video.status === 'failed'
                    ? 'error'
                    : 'secondary'
                }
              >
                {status.label}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>Created {formatDate(video.created_at)}</span>
              {video.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span>{video.resolution}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {video.status === 'ready' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPublishDialog(true)}
              >
                <Send className="mr-1.5 h-4 w-4" />
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Video player */}
        <div className="lg:col-span-1">
          {video.video_url ? (
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url}
              className="w-full"
              aspectRatios={[
                { ratio: '9:16', url: video.video_url },
                { ratio: '1:1', url: video.video_url },
                { ratio: '4:5', url: video.video_url },
              ]}
              onDownload={handleDownload}
            />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-xl bg-gray-100">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  Video not yet available
                </p>
                {video.pipeline_metadata?.progress !== undefined && (
                  <p className="mt-1 text-xs text-gray-400">
                    {video.pipeline_metadata.progress}% complete
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Download buttons */}
          {video.status === 'ready' && video.video_url && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  { ratio: '9:16' as const, icon: Smartphone, label: '9:16' },
                  { ratio: '1:1' as const, icon: Square, label: '1:1' },
                  { ratio: '4:5' as const, icon: RectangleHorizontal, label: '4:5' },
                ] as const
              ).map(({ ratio, icon: Icon, label }) => (
                <Button
                  key={ratio}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDownload(ratio)}
                >
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {label}
                  <Download className="ml-1 h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4 lg:col-span-2">
          {/* Script text side by side */}
          {script && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Script
                  </CardTitle>
                  <Link href={`/dashboard/scripts/${script.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Full Script
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Hook
                  </h5>
                  <p className="rounded-lg bg-indigo-50 p-3 text-sm text-gray-700">
                    {script.hook}
                  </p>
                </div>
                <div>
                  <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Body
                  </h5>
                  <p className="line-clamp-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {script.body}
                  </p>
                </div>
                <div>
                  <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-600">
                    CTA
                  </h5>
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-gray-700">
                    {script.cta}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pipeline status */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineStatus
                video={video}
                onRetry={handleRetryPipeline}
                expanded
              />
            </CardContent>
          </Card>

          {/* Clip breakdown */}
          {clips.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Clip Breakdown
                    <Badge variant="secondary" className="text-[10px]">
                      {clips.length} clips
                    </Badge>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedClips(!expandedClips)}
                  >
                    {expandedClips ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedClips && (
                <CardContent>
                  <div className="space-y-2">
                    {clips
                      .sort((a, b) => a.sequence_order - b.sequence_order)
                      .map((clip) => (
                        <div
                          key={clip.id}
                          className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">
                            {clip.sequence_order}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize text-gray-900">
                                {clip.clip_type}
                              </span>
                              <Badge
                                variant={
                                  clip.status === 'ready'
                                    ? 'success'
                                    : clip.status === 'failed'
                                    ? 'error'
                                    : clip.status === 'processing'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-[10px]"
                              >
                                {clip.status}
                              </Badge>
                            </div>
                            {clip.duration && (
                              <span className="text-xs text-gray-400">
                                {formatDuration(clip.duration)}
                              </span>
                            )}
                          </div>
                          {clip.video_clip_url && (
                            <Button variant="ghost" size="sm" className="h-7">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* QA Controls */}
          {video.status === 'ready' && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-500">
                  Review the video and approve it for publishing, or reject it
                  with notes for re-production.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    isLoading={isApproving}
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isApproving}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-gray-400">
                    Resolution
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {video.resolution}
                  </dd>
                </div>
                {video.duration && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400">
                      Duration
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {formatDuration(video.duration)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-400">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(video.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        video.status === 'ready'
                          ? 'success'
                          : video.status === 'failed'
                          ? 'error'
                          : 'secondary'
                      }
                    >
                      {status.label}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
      >
        <DialogHeader>
          <DialogTitle>Reject Video</DialogTitle>
          <DialogDescription>
            Provide notes on what needs to change before re-producing this
            video.
          </DialogDescription>
        </DialogHeader>
        <div>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="What needs to be fixed..."
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRejectDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectNotes.trim()}
            isLoading={isApproving}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Publish dialog */}
      <Dialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
      >
        <DialogHeader>
          <DialogTitle>Publish Video</DialogTitle>
          <DialogDescription>
            Choose a platform and optionally schedule the publish time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all',
                    selectedPlatform === platform.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-gray-400">
              Leave empty to publish immediately
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowPublishDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!selectedPlatform}
            isLoading={isPublishing}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {scheduleDate ? 'Schedule' : 'Publish Now'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
