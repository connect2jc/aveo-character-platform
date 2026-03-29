import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { StudioProject, StudioTrack } from '@/types';

export function useStudio() {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [project, setProject] = useState<StudioProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/v1/studio/projects?page=${page}`);
      setProjects(data.data.projects);
      return data.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/v1/studio/projects/${id}`);
      setProject(data.data.project);
      return data.data.project;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (title: string, aspectRatio?: string) => {
    const { data } = await api.post('/api/v1/studio/projects', { title, aspectRatio });
    return data.data.project as StudioProject;
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<StudioProject>) => {
    const { data } = await api.patch(`/api/v1/studio/projects/${id}`, updates);
    setProject(data.data.project);
    return data.data.project;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await api.delete(`/api/v1/studio/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTrack = useCallback(async (projectId: string, track: Partial<StudioTrack>) => {
    const { data } = await api.post(`/api/v1/studio/projects/${projectId}/tracks`, track);
    return data.data.track as StudioTrack;
  }, []);

  const updateTrack = useCallback(async (projectId: string, trackId: string, updates: Partial<StudioTrack>) => {
    const { data } = await api.patch(`/api/v1/studio/projects/${projectId}/tracks/${trackId}`, updates);
    return data.data.track as StudioTrack;
  }, []);

  const deleteTrack = useCallback(async (projectId: string, trackId: string) => {
    await api.delete(`/api/v1/studio/projects/${projectId}/tracks/${trackId}`);
  }, []);

  const uploadFile = useCallback(async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/api/v1/studio/projects/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as { url: string; fileName: string; mimeType: string; size: number };
  }, []);

  const importVideo = useCallback(async (projectId: string, videoId: string) => {
    const { data } = await api.post(`/api/v1/studio/projects/${projectId}/import-video/${videoId}`);
    return data.data.track as StudioTrack;
  }, []);

  const startRender = useCallback(async (projectId: string) => {
    const { data } = await api.post(`/api/v1/studio/projects/${projectId}/render`);
    return data.data;
  }, []);

  const getRenderStatus = useCallback(async (projectId: string) => {
    const { data } = await api.get(`/api/v1/studio/projects/${projectId}/render-status`);
    return data.data;
  }, []);

  return {
    projects,
    project,
    loading,
    error,
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addTrack,
    updateTrack,
    deleteTrack,
    uploadFile,
    importVideo,
    startRender,
    getRenderStatus,
  };
}
