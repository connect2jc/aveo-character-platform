'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageSelectorProps {
  images: string[];
  selected?: string;
  onSelect: (url: string) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function ImageSelector({ images, selected, onSelect, onGenerate, isGenerating }: ImageSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url) => (
          <button
            key={url}
            onClick={() => onSelect(url)}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
              selected === url
                ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {selected === url && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20">
                <div className="rounded-full bg-indigo-600 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      {onGenerate && (
        <Button variant="outline" onClick={onGenerate} isLoading={isGenerating}>
          Generate More Variations
        </Button>
      )}
    </div>
  );
}
