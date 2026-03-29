'use client';

import { Video as VideoIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/videos/video-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useVideos } from '@/hooks/use-videos';

export default function VideosPage() {
  const { videos, isLoading, error, page, totalPages, setPage } = useVideos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage all your generated videos.
          </p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
            <VideoIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No videos yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Videos will appear here once you generate them from your characters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
