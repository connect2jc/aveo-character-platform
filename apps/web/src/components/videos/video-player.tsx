'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(p);
  };

  return (
    <div className={cn('group relative overflow-hidden rounded-xl bg-black', className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Progress bar */}
        <div className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-indigo-300">
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-indigo-300"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            onClick={() => videoRef.current?.requestFullscreen()}
            className="text-white hover:text-indigo-300"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}
