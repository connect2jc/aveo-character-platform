'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Check, Volume2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

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
  onTestVoice?: (text: string, voiceId: string) => void;
}

export function VoiceSelector({ voices, selected, onSelect, onSettingsChange, onTestVoice }: VoiceSelectorProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [stability, setStability] = useState(75);
  const [similarity, setSimilarity] = useState(75);
  const [testText, setTestText] = useState('');
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const handlePlay = (voice: Voice) => {
    if (playing === voice.id) {
      audioRefs.current[voice.id]?.pause();
      setPlaying(null);
      return;
    }

    // Pause any currently playing audio
    if (playing && audioRefs.current[playing]) {
      audioRefs.current[playing].pause();
    }

    if (voice.preview_url) {
      if (!audioRefs.current[voice.id]) {
        const audio = new Audio(voice.preview_url);
        audio.addEventListener('ended', () => {
          setPlaying(null);
          setAudioProgress(prev => ({ ...prev, [voice.id]: 0 }));
        });
        audio.addEventListener('timeupdate', () => {
          const progress = (audio.currentTime / audio.duration) * 100;
          setAudioProgress(prev => ({ ...prev, [voice.id]: progress }));
        });
        audioRefs.current[voice.id] = audio;
      }
      audioRefs.current[voice.id].play();
    }
    setPlaying(voice.id);
  };

  return (
    <div className="space-y-6">
      {/* Voice Options */}
      <div className="grid grid-cols-1 gap-3">
        {voices.map((voice) => {
          const isSelected = selected === voice.id;
          const isPlaying = playing === voice.id;
          const progress = audioProgress[voice.id] || 0;

          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={cn(
                'relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
              )}
            >
              {/* Progress Bar Background */}
              {isPlaying && (
                <div
                  className="absolute inset-0 bg-indigo-100/40 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              )}

              {/* Play Button */}
              <div className="relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(voice);
                  }}
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200',
                    isPlaying
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>
              </div>

              {/* Voice Info */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{voice.name}</p>
                  {isPlaying && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className="w-0.5 rounded-full bg-indigo-500"
                          style={{
                            height: `${8 + Math.random() * 8}px`,
                            animation: 'pulse 0.5s ease-in-out infinite alternate',
                            animationDelay: `${bar * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 truncate">{voice.description}</p>
              </div>

              {/* Selected Indicator */}
              <div className="relative z-10">
                {isSelected ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 shadow-md">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200">
                    <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Voice Settings */}
      {selected && (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <h4 className="text-sm font-semibold text-gray-900">Voice Settings</h4>
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

          {/* Test with custom text */}
          <div className="pt-2 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Test with custom text</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Type something to hear this voice say it..."
                className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Button
                size="sm"
                disabled={!testText.trim()}
                onClick={() => onTestVoice?.(testText, selected)}
                className="h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
