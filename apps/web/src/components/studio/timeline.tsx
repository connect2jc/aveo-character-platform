'use client';

import { useState, useMemo } from 'react';
import { Film, Music, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import type { StudioTrack } from '@/types';

interface TimelineProps {
  tracks: StudioTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onAddTrack: () => void;
}

const PIXELS_PER_SECOND_BASE = 40;

export function Timeline({ tracks, selectedTrackId, onSelectTrack, onAddTrack }: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  const { videoTracks, audioTracks, totalDuration } = useMemo(() => {
    const videoTracks = tracks.filter((t) => t.type === 'video');
    const audioTracks = tracks.filter((t) => t.type === 'audio');

    let maxEnd = 0;
    tracks.forEach((t) => {
      const effectiveDuration = t.duration || 10;
      const end = t.startTime + effectiveDuration - t.trimStart - (t.trimEnd ? effectiveDuration - t.trimEnd : 0);
      if (end > maxEnd) maxEnd = end;
    });

    return { videoTracks, audioTracks, totalDuration: Math.max(maxEnd, 30) };
  }, [tracks]);

  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = zoom >= 2 ? 1 : zoom >= 1 ? 5 : 10;
    for (let t = 0; t <= totalDuration; t += interval) {
      markers.push(t);
    }
    return markers;
  }, [totalDuration, zoom]);

  const renderTrackRow = (label: string, icon: typeof Film, trackList: StudioTrack[], color: string) => (
    <div className="flex border-b border-gray-200 last:border-b-0">
      {/* Track label */}
      <div className="flex w-28 flex-shrink-0 items-center gap-2 border-r border-gray-200 bg-gray-50 px-3 py-2">
        {icon === Film ? <Film className="h-3.5 w-3.5 text-gray-400" /> : <Music className="h-3.5 w-3.5 text-gray-400" />}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>

      {/* Track area */}
      <div className="relative flex-1 h-10 min-w-0">
        {trackList.map((track) => {
          const effectiveDuration = track.duration || 10;
          const trimmedDuration = effectiveDuration - track.trimStart - (track.trimEnd ? effectiveDuration - track.trimEnd : 0);
          const width = Math.max(trimmedDuration * pixelsPerSecond, 20);
          const left = track.startTime * pixelsPerSecond;

          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={cn(
                'absolute top-1 h-8 rounded-md px-2 text-[10px] font-medium text-white truncate transition-all',
                color,
                selectedTrackId === track.id && 'ring-2 ring-white ring-offset-1 ring-offset-gray-100'
              )}
              style={{ left: `${left}px`, width: `${width}px` }}
              title={track.fileName || track.type}
            >
              {track.fileName || track.type}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Group video tracks by trackIndex
  const videoByIndex = useMemo(() => {
    const groups: Record<number, StudioTrack[]> = {};
    tracks.filter(t => t.type === 'video').forEach((t) => {
      const idx = t.trackIndex;
      if (!groups[idx]) groups[idx] = [];
      groups[idx].push(t);
    });
    return groups;
  }, [tracks]);

  const audioByIndex = useMemo(() => {
    const groups: Record<number, StudioTrack[]> = {};
    tracks.filter(t => t.type === 'audio').forEach((t) => {
      const idx = t.trackIndex;
      if (!groups[idx]) groups[idx] = [];
      groups[idx].push(t);
    });
    return groups;
  }, [tracks]);

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Timeline header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
        <h3 className="text-xs font-semibold text-gray-700">Timeline</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="text-gray-400 hover:text-gray-600">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="text-gray-400 hover:text-gray-600">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Time ruler */}
      <div className="flex border-b border-gray-200">
        <div className="w-28 flex-shrink-0 border-r border-gray-200 bg-gray-50" />
        <div className="relative flex-1 h-5 overflow-x-auto">
          {timeMarkers.map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full border-l border-gray-200"
              style={{ left: `${t * pixelsPerSecond}px` }}
            >
              <span className="absolute top-0.5 left-1 text-[9px] text-gray-400">
                {formatDuration(t)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Track rows */}
      <div className="max-h-48 overflow-y-auto">
        {Object.keys(videoByIndex).length === 0 && Object.keys(audioByIndex).length === 0 ? (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <p className="text-xs">Add clips from the library to get started</p>
          </div>
        ) : (
          <>
            {Object.entries(videoByIndex).map(([idx, tracks]) =>
              renderTrackRow(`Video ${Number(idx) + 1}`, Film, tracks, 'bg-indigo-500')
            )}
            {Object.entries(audioByIndex).map(([idx, tracks]) =>
              renderTrackRow(`Audio ${Number(idx) + 1}`, Music, tracks, 'bg-emerald-500')
            )}
          </>
        )}
      </div>

      {/* Add track */}
      <div className="border-t border-gray-200 px-3 py-1.5">
        <button
          onClick={onAddTrack}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-3 w-3" />
          Add Track
        </button>
      </div>
    </div>
  );
}
