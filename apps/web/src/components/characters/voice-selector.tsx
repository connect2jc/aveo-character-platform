'use client';

import { useState } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface Voice {
  id: string;
  name: string;
  description: string;
  preview_url?: string;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selected?: string;
  onSelect: (voiceId: string) => void;
  onSettingsChange?: (settings: { stability: number; similarity_boost: number }) => void;
}

export function VoiceSelector({ voices, selected, onSelect, onSettingsChange }: VoiceSelectorProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [stability, setStability] = useState(75);
  const [similarity, setSimilarity] = useState(75);

  const handlePlay = (voiceId: string) => {
    setPlaying(playing === voiceId ? null : voiceId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
              selected === voice.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(voice.id);
              }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            >
              {playing === voice.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{voice.name}</p>
              <p className="text-xs text-gray-500">{voice.description}</p>
            </div>
            {selected === voice.id && (
              <Check className="h-5 w-5 text-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="mb-4 text-sm font-medium text-gray-900">Voice Settings</h4>
          <div className="space-y-4">
            <Slider
              label="Stability"
              value={stability}
              onChange={(v) => {
                setStability(v);
                onSettingsChange?.({ stability: v / 100, similarity_boost: similarity / 100 });
              }}
            />
            <Slider
              label="Similarity"
              value={similarity}
              onChange={(v) => {
                setSimilarity(v);
                onSettingsChange?.({ stability: stability / 100, similarity_boost: v / 100 });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
