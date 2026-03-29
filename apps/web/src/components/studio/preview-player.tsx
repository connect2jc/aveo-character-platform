'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

interface PreviewPlayerProps {
  src?: string;
  poster?: string;
  className?: string;
}

export function PreviewPlayer({ src, poster, className }: PreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className={cn('relative rounded-lg bg-black overflow-hidden', className)}>
      {src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
            muted={muted}
          />

          {/* Controls overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            {/* Seek bar */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-indigo-500"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="text-white hover:text-indigo-300">
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button onClick={() => setMuted(!muted)} className="text-white hover:text-indigo-300">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="text-xs text-white/70">
                  {formatDuration(Math.round(currentTime))} / {formatDuration(Math.round(duration))}
                </span>
              </div>
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="text-white hover:text-indigo-300"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          <p className="text-sm">Select a clip to preview</p>
        </div>
      )}
    </div>
  );
}
