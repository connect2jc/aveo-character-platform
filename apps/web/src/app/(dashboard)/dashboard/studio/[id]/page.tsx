'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewPlayer } from '@/components/studio/preview-player';
import { VideoGrid } from '@/components/studio/video-grid';
import { Timeline } from '@/components/studio/timeline';
import { TrackControls } from '@/components/studio/track-controls';
import { useStudio } from '@/hooks/use-studio';
import toast from 'react-hot-toast';
import type { StudioTrack } from '@/types';

export default function StudioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    project,
    getProject,
    updateProject,
    addTrack,
    updateTrack,
    deleteTrack,
    uploadFile,
    startRender,
    getRenderStatus,
    loading,
  } = useStudio();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [rendering, setRendering] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; fileName: string; mimeType: string }>>([]);

  const loadProject = useCallback(async () => {
    await getProject(projectId);
  }, [projectId, getProject]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (project) {
      setTitleValue(project.title);
      if (project.status === 'RENDERING') {
        setRendering(true);
        pollRender();
      }
    }
  }, [project?.id]);

  const pollRender = async () => {
    const interval = setInterval(async () => {
      try {
        const status = await getRenderStatus(projectId);
        if (status.status === 'COMPLETED') {
          clearInterval(interval);
          setRendering(false);
          toast.success('Render complete!');
          loadProject();
        } else if (status.status === 'FAILED') {
          clearInterval(interval);
          setRendering(false);
          toast.error('Render failed');
          loadProject();
        }
      } catch {
        clearInterval(interval);
        setRendering(false);
      }
    }, 5000);
  };

  const selectedTrack = project?.tracks?.find((t) => t.id === selectedTrackId) || null;

  const handleTitleSave = async () => {
    if (titleValue && titleValue !== project?.title) {
      await updateProject(projectId, { title: titleValue });
      toast.success('Title updated');
    }
    setEditingTitle(false);
  };

  const handleAddClip = async (url: string, fileName: string, type: 'video' | 'audio') => {
    try {
      const nextIndex = (project?.tracks || []).filter((t) => t.type === type).length;
      await addTrack(projectId, {
        type,
        sourceUrl: url,
        fileName,
        trackIndex: Math.floor(nextIndex / 3),
      });
      toast.success('Clip added to timeline');
      loadProject();
      setPreviewUrl(url);
    } catch {
      toast.error('Failed to add clip');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadFile(projectId, file);
      setUploadedFiles((prev) => [...prev, result]);
      toast.success('File uploaded');
    } catch {
      toast.error('Failed to upload file');
    }
  };

  const handleUpdateTrack = async (trackId: string, updates: Partial<StudioTrack>) => {
    try {
      await updateTrack(projectId, trackId, updates);
      loadProject();
    } catch {
      toast.error('Failed to update track');
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack(projectId, trackId);
      if (selectedTrackId === trackId) setSelectedTrackId(null);
      toast.success('Track removed');
      loadProject();
    } catch {
      toast.error('Failed to remove track');
    }
  };

  const handleRender = async () => {
    try {
      setRendering(true);
      await startRender(projectId);
      toast.success('Render started');
      pollRender();
    } catch (err: unknown) {
      setRendering(false);
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(e.response?.data?.error?.message || 'Failed to start render');
    }
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/studio')}>
          Back to Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/studio')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="h-8 rounded border border-indigo-300 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
            >
              {project.title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {project.status === 'COMPLETED' && project.outputUrl && (
            <a href={project.outputUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </Button>
            </a>
          )}
          <Button
            size="sm"
            onClick={handleRender}
            disabled={rendering || !project.tracks?.length}
          >
            {rendering ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Render
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Preview */}
        <div className="flex-1 p-4">
          <PreviewPlayer
            src={previewUrl || project.outputUrl || undefined}
            poster={project.thumbnailUrl || undefined}
            className="h-full"
          />
        </div>

        {/* Clip library */}
        <div className="w-72 border-l border-gray-200 flex flex-col">
          <VideoGrid
            onSelect={handleAddClip}
            onUpload={handleUpload}
            uploadedFiles={uploadedFiles}
          />
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        tracks={project.tracks || []}
        selectedTrackId={selectedTrackId}
        onSelectTrack={(id) => {
          setSelectedTrackId(id);
          const track = project.tracks?.find((t) => t.id === id);
          if (track) setPreviewUrl(track.sourceUrl);
        }}
        onAddTrack={() => {
          // Scroll to clip library
          toast('Select a clip from the library to add', { icon: '👆' });
        }}
      />

      {/* Track controls */}
      <TrackControls
        track={selectedTrack}
        onUpdate={handleUpdateTrack}
        onDelete={handleDeleteTrack}
      />
    </div>
  );
}
