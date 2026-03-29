'use client';

import { Check, X, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CharacterVariation } from '@/types';

interface VariationGalleryProps {
  variations: CharacterVariation[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

export function VariationGallery({ variations, onApprove, onReject, onRegenerate }: VariationGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {variations.map((variation) => (
        <div
          key={variation.id}
          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="aspect-square">
            <img
              src={variation.image_url}
              alt={variation.variation_type}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between">
              <Badge variant={variation.is_approved ? 'success' : 'secondary'}>
                {variation.variation_type}
              </Badge>
              {variation.is_approved && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            {!variation.is_approved && onApprove && (
              <Button size="icon" onClick={() => onApprove(variation.id)}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            {onReject && (
              <Button size="icon" variant="destructive" onClick={() => onReject(variation.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
            {onRegenerate && (
              <Button size="icon" variant="secondary" onClick={() => onRegenerate(variation.id)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
