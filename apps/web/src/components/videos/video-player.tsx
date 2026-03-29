'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Subtitles,
  RectangleHorizontal,
  Smartphone,
  Square,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

type AspectRatio = '9:16' | '1:1' | '4:5';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  aspectRatios?: { ratio: AspectRatio; url: string }[];
  captionSrc?: string;
  onDownload?: (ratio: AspectRatio) => void;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
};

const aspectRatioIcons: Record<AspectRatio, typeof Smartphone> = {
  '9:16': Smartphone,
  '1:1': Square,
  '4:5': RectangleHorizontal,
};

export function VideoPlayer({
  src,
  poster,
  className,
  aspectRatios,
  captionSrc,
  onDownload,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeRatio, setActiveRatio] = useState<AspectRatio>('9:16');
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(ct);
    setProgress((ct / dur) * 100);

    // Update buffered
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(
        videoRef.current.buffered.length - 1
      );
      setBuffered((bufferedEnd / dur) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    },
    []
  );

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setHoverTime(pos * videoRef.current.duration);
      setHoverPosition(e.clientX - rect.left);
    },
    []
  );

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  const activeSrc =
    aspectRatios?.find((r) => r.ratio === activeRatio)?.url || src;

  return (
    <div className={cn('group relative overflow-hidden rounded-xl bg-black', className)}>
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        className={cn(
          'h-full w-full object-contain transition-all',
          aspectRatioClasses[activeRatio]
        )}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        playsInline
      >
        {captionSrc && (
          <track
            kind="captions"
            src={captionSrc}
            default={showCaptions}
          />
        )}
      </video>

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="group/progress relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2.5"
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: `${buffered}%` }}
          />
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber */}
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/progress:opacity-100"
            style={{ left: `${progress}%` }}
          />
          {/* Hover time tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-xs text-white"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatDuration(Math.floor(hoverTime))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white transition-colors hover:text-indigo-300"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Volume */}
            <div
              className="relative flex items-center gap-1"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="text-white transition-colors hover:text-indigo-300"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              {showVolumeSlider && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              )}
            </div>

            {/* Time display */}
            <span className="text-xs text-white/80">
              {formatDuration(Math.floor(currentTime))} /{' '}
              {formatDuration(Math.floor(duration))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Aspect ratio toggle */}
            {aspectRatios && aspectRatios.length > 1 && (
              <div className="flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5">
                {aspectRatios.map(({ ratio }) => {
                  const Icon = aspectRatioIcons[ratio];
                  return (
                    <button
                      key={ratio}
                      onClick={() => setActiveRatio(ratio)}
                      className={cn(
                        'rounded-md px-2 py-1 text-xs transition-colors',
                        activeRatio === ratio
                          ? 'bg-white/20 text-white'
                          : 'text-white/50 hover:text-white/80'
                      )}
                      title={ratio}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Captions toggle */}
            {captionSrc && (
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={cn(
                  'transition-colors',
                  showCaptions
                    ? 'text-indigo-400'
                    : 'text-white/50 hover:text-white'
                )}
              >
                <Subtitles className="h-5 w-5" />
              </button>
            )}

            {/* Download */}
            {onDownload && (
              <button
                onClick={() => onDownload(activeRatio)}
                className="text-white/50 transition-colors hover:text-white"
              >
                <Download className="h-5 w-5" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white transition-colors hover:text-indigo-300"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center play button when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="ml-1 h-8 w-8 text-white" />
          </div>
        </button>
      )}
    </div>
  );
}
