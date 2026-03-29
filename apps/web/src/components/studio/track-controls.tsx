'use client';

import { useState } from 'react';
import { Scissors, Volume2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudioTrack } from '@/types';
import { formatDuration } from '@/lib/utils';

interface TrackControlsProps {
  track: StudioTrack | null;
  onUpdate: (trackId: string, updates: Partial<StudioTrack>) => void;
  onDelete: (trackId: string) => void;
}

export function TrackControls({ track, onUpdate, onDelete }: TrackControlsProps) {
  if (!track) {
    return (
      <div className="flex items-center justify-center border-t border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-400">Select a track to edit</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span className="truncate max-w-[120px]">{track.fileName || track.type}</span>
      </div>

      {/* Trim controls */}
      <div className="flex items-center gap-2">
        <Scissors className="h-4 w-4 text-gray-400" />
        <label className="text-xs text-gray-500">Start</label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={track.trimStart}
          onChange={(e) => onUpdate(track.id, { trimStart: parseFloat(e.target.value) || 0 })}
          className="h-7 w-16 rounded border border-gray-300 px-2 text-xs"
        />
        <label className="text-xs text-gray-500">End</label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={track.trimEnd || ''}
          onChange={(e) => onUpdate(track.id, { trimEnd: e.target.value ? parseFloat(e.target.value) : undefined })}
          placeholder="Auto"
          className="h-7 w-16 rounded border border-gray-300 px-2 text-xs"
        />
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={track.volume}
          onChange={(e) => onUpdate(track.id, { volume: parseFloat(e.target.value) })}
          className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-500"
        />
        <span className="text-xs text-gray-500 w-8">{Math.round(track.volume * 100)}%</span>
      </div>

      {/* Position */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Position</label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={track.startTime}
          onChange={(e) => onUpdate(track.id, { startTime: parseFloat(e.target.value) || 0 })}
          className="h-7 w-16 rounded border border-gray-300 px-2 text-xs"
        />
        <span className="text-xs text-gray-400">s</span>
      </div>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onDelete(track.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
