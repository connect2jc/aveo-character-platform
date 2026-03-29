'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Video as VideoIcon,
  Search,
  X,
  CheckSquare,
  Square,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/videos/video-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useVideos } from '@/hooks/use-videos';
import { cn } from '@/lib/utils';

type SortMode = 'newest' | 'oldest' | 'character';
type StatusFilter = 'all' | 'queued' | 'generating_audio' | 'generating_lipsync' | 'compositing' | 'ready' | 'failed';

export default function VideosPage() {
  const { videos, isLoading, error, page, totalPages, setPage } = useVideos();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Sort
    switch (sortMode) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'character':
        result.sort((a, b) => a.character_id.localeCompare(b.character_id));
        break;
    }

    return result;
  }, [videos, searchQuery, statusFilter, sortMode]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredVideos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVideos.map((v) => v.id)));
    }
  };

  const handleBulkDownload = useCallback(() => {
    // In production, this would call an API to generate a zip
    console.log('Bulk download:', Array.from(selectedIds));
  }, [selectedIds]);

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: videos.length },
    { key: 'queued', label: 'Queued', count: videos.filter((v) => v.status === 'queued').length },
    { key: 'generating_audio', label: 'Audio', count: videos.filter((v) => v.status === 'generating_audio').length },
    { key: 'generating_lipsync', label: 'Lip Sync', count: videos.filter((v) => v.status === 'generating_lipsync').length },
    { key: 'compositing', label: 'Compositing', count: videos.filter((v) => v.status === 'compositing').length },
    { key: 'ready', label: 'Ready', count: videos.filter((v) => v.status === 'ready').length },
    { key: 'failed', label: 'Failed', count: videos.filter((v) => v.status === 'failed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage all your generated videos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedIds(new Set());
            }}
          >
            {selectMode ? (
              <>
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <CheckSquare className="mr-1.5 h-4 w-4" />
                Select
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and filters bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="character">By character</option>
          </select>
        </div>

        {/* Status filter tabs */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-white p-1.5">
            {statusOptions
              .filter((opt) => opt.count > 0 || opt.key === 'all')
              .map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    statusFilter === opt.key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {opt.label}
                  <span className="ml-1 text-[10px] text-gray-400">
                    ({opt.count})
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
          <button
            onClick={toggleSelectAll}
            className="text-indigo-600 hover:text-indigo-700"
          >
            {selectedIds.size === filteredVideos.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <span className="text-sm font-medium text-indigo-700">
            {selectedIds.size} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleBulkDownload}
            >
              <Package className="mr-1.5 h-3.5 w-3.5" />
              Download ZIP
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
            <VideoIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {searchQuery || statusFilter !== 'all'
              ? 'No matching videos'
              : 'No videos yet'}
          </h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Videos will appear here once you generate them from your characters.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing {filteredVideos.length}{' '}
              {filteredVideos.length === 1 ? 'video' : 'videos'}
            </span>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                selectable={selectMode}
                selected={selectedIds.has(video.id)}
                onSelect={toggleSelect}
                onDownload={(v) => console.log('Download:', v.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }).map(
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                          page === pageNum
                            ? 'bg-indigo-600 font-medium text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                {totalPages > 7 && (
                  <>
                    <span className="px-1 text-gray-400">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                        page === totalPages
                          ? 'bg-indigo-600 font-medium text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
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
