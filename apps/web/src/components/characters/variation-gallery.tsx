'use client';

import { useState } from 'react';
import { Check, RotateCw, Plus, ZoomIn, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CharacterVariation } from '@/types';
import { cn } from '@/lib/utils';

interface VariationGalleryProps {
  variations: CharacterVariation[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  outfit: { label: 'Outfit', color: 'bg-blue-100 text-blue-700' },
  expression: { label: 'Expression', color: 'bg-purple-100 text-purple-700' },
  pose: { label: 'Pose', color: 'bg-orange-100 text-orange-700' },
  background: { label: 'Background', color: 'bg-green-100 text-green-700' },
};

export function VariationGallery({
  variations,
  onApprove,
  onReject: _onReject, // eslint-disable-line @typescript-eslint/no-unused-vars
  onRegenerate,
  onDelete,
  onAddNew,
}: VariationGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<CharacterVariation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Add New Variation Card */}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="mt-3 text-sm font-medium text-gray-600">Add Variation</span>
          </button>
        )}

        {/* Variation Cards */}
        {variations.map((variation) => {
          const config = typeConfig[variation.variation_type] || {
            label: variation.variation_type,
            color: 'bg-gray-100 text-gray-700',
          };

          return (
            <div
              key={variation.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={variation.image_url}
                  alt={variation.variation_type}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Info Bar */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', config.color)}>
                    {config.label}
                  </span>
                  {variation.is_approved && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3.5 w-3.5" />
                      <span>Approved</span>
                    </div>
                  )}
                </div>
                {variation.prompt_used && (
                  <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">
                    {variation.prompt_used}
                  </p>
                )}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-all duration-200 group-hover:opacity-100">
                {/* View Button */}
                <button
                  onClick={() => setLightboxImage(variation)}
                  className="rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                >
                  <ZoomIn className="h-4 w-4 text-gray-700" />
                </button>

                {/* Approve Button */}
                {!variation.is_approved && onApprove && (
                  <button
                    onClick={() => onApprove(variation.id)}
                    className="rounded-full bg-green-500 p-2.5 shadow-md transition-colors hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </button>
                )}

                {/* Regenerate Button */}
                {onRegenerate && (
                  <button
                    onClick={() => onRegenerate(variation.id)}
                    className="rounded-full bg-indigo-500 p-2.5 shadow-md transition-colors hover:bg-indigo-600"
                  >
                    <RotateCw className="h-4 w-4 text-white" />
                  </button>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <button
                    onClick={() => setDeleteConfirm(variation.id)}
                    className="rounded-full bg-red-500 p-2.5 shadow-md transition-colors hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {variations.length === 0 && !onAddNew && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <Plus className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No variations yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate outfit, expression, and pose variations for this character.
          </p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        className="max-w-3xl p-0 overflow-hidden"
      >
        {lightboxImage && (
          <div>
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.variation_type}
              className="w-full object-contain"
            />
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
                  typeConfig[lightboxImage.variation_type]?.color || 'bg-gray-100 text-gray-700'
                )}>
                  {typeConfig[lightboxImage.variation_type]?.label || lightboxImage.variation_type}
                </span>
                {lightboxImage.is_approved && (
                  <Badge variant="success">Approved</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLightboxImage(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete Variation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this variation? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteConfirm) {
                onDelete?.(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
