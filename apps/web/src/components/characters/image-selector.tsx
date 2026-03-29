'use client';

import { useState } from 'react';
import { Check, RefreshCw, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';

interface ImageSelectorProps {
  images: string[];
  selected?: string;
  onSelect: (url: string) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function ImageSelector({ images, selected, onSelect, onGenerate, isGenerating }: ImageSelectorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (isGenerating && images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <Skeleton className="h-full w-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">Generating character images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((url, index) => (
          <button
            key={url}
            onClick={() => onSelect(url)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200',
              selected === url
                ? 'border-indigo-600 ring-4 ring-indigo-600/20 shadow-lg'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            )}
          >
            <img src={url} alt={`Option ${index + 1}`} className="h-full w-full object-cover" />

            {/* Hover Overlay */}
            <div className={cn(
              'absolute inset-0 flex items-center justify-center gap-2 transition-all duration-200',
              selected === url
                ? 'bg-indigo-600/20'
                : 'bg-black/0 group-hover:bg-black/20'
            )}>
              {selected === url ? (
                <div className="rounded-full bg-indigo-600 p-2 shadow-lg">
                  <Check className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(url);
                    }}
                    className="rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Selection Label */}
            {selected === url && (
              <div className="absolute bottom-2 left-2 right-2">
                <span className="block rounded-lg bg-indigo-600 px-3 py-1 text-center text-xs font-semibold text-white shadow-md">
                  Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {selected && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            Image selected
          </p>
        )}
        {onGenerate && (
          <Button
            variant="outline"
            onClick={onGenerate}
            isLoading={isGenerating}
            className="ml-auto"
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isGenerating && 'animate-spin')} />
            Regenerate All
          </Button>
        )}
      </div>

      {/* Preview Lightbox */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} className="max-w-2xl p-2">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-lg object-contain"
          />
        )}
      </Dialog>
    </div>
  );
}
