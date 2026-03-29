'use client';

import { useState, useEffect } from 'react';
import { Film, Upload, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import type { Video } from '@/types';

interface VideoGridProps {
  onSelect: (url: string, fileName: string, type: 'video' | 'audio') => void;
  onUpload: (file: File) => void;
  uploadedFiles: Array<{ url: string; fileName: string; mimeType: string }>;
}

export function VideoGrid({ onSelect, onUpload, uploadedFiles }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const { data } = await api.get('/api/v1/videos?limit=50');
        setVideos(data.data.videos?.filter((v: Video) => v.video_url) || []);
      } catch {
        // Silently fail
      }
    };
    loadVideos();
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Clip Library</h3>
        <label className="cursor-pointer">
          <input type="file" accept="video/*,audio/*" onChange={handleFileInput} className="hidden" />
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100">
            <Upload className="h-3 w-3" />
            Upload
          </span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Uploaded files */}
          {uploadedFiles.map((file, idx) => (
            <button
              key={`upload-${idx}`}
              onClick={() => onSelect(file.url, file.fileName, file.mimeType.startsWith('audio') ? 'audio' : 'video')}
              className="group relative aspect-video rounded-lg bg-gray-100 overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
            >
              <div className="flex h-full items-center justify-center">
                <Film className="h-6 w-6 text-gray-400" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
                <p className="truncate text-[10px] text-white">{file.fileName}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </button>
          ))}

          {/* Generated Aveo videos */}
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => onSelect(video.video_url!, video.title || `Video ${video.id.slice(0, 8)}`, 'video')}
              onMouseEnter={() => setHoveredId(video.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative aspect-video rounded-lg bg-gray-100 overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
            >
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Film className="h-6 w-6 text-gray-400" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
                <p className="truncate text-[10px] text-white">{video.title || 'Aveo Video'}</p>
                {video.duration && (
                  <div className="flex items-center gap-1 text-[9px] text-white/70">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDuration(Math.round(video.duration))}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </button>
          ))}

          {videos.length === 0 && uploadedFiles.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-8 text-gray-400">
              <Film className="h-8 w-8 mb-2" />
              <p className="text-xs">No clips available</p>
              <p className="text-[10px]">Upload files or generate videos first</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
