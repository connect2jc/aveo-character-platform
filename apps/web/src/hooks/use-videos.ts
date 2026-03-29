'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Video, ApiResponse, PaginatedResponse } from '@/types';

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
      const { data } = await api.get<PaginatedResponse<Video>>(
        `/api/v1/videos?${params}`
      );
      setVideos(data.data);
      setTotalPages(data.total_pages);
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
