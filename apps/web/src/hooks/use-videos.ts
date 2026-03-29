'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Video, ApiResponse } from '@/types';

export function useVideos(characterId?: string) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (characterId) params.set('character_id', characterId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await api.get<Record<string, any>>(
        `/api/v1/videos?${params}`
      );
      // API returns { success, data: { videos, total, page, limit, totalPages } }
      const payload = data.data || data;
      setVideos(Array.isArray(payload) ? payload : (payload.videos || []));
      setTotalPages(payload.totalPages || payload.total_pages || 1);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [characterId, page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    fetchVideos,
  };
}

export function useVideo(id: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get<ApiResponse<Video>>(`/api/v1/videos/${id}`)
      .then(({ data }) => setVideo(data.data))
      .catch(() => setError('Failed to load video'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { video, isLoading, error, setVideo };
}
