'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Sparkles,
  Video,
  FileText,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragDropCalendar } from '@/components/calendar/drag-drop-calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCalendar } from '@/hooks/use-calendar';
import { useCharacter } from '@/hooks/use-characters';
import { ContentSlot } from '@/types';
import { format } from 'date-fns';

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { character } = useCharacter(params.id);
  const { slots, isLoading, moveSlot, updateSlot } = useCalendar(params.id);
  const [selectedSlot, setSelectedSlot] = useState<ContentSlot | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);

  const handleSlotClick = useCallback((slot: ContentSlot) => {
    setSelectedSlot(slot);
    setShowDetailPanel(true);
  }, []);

  const handleSlotMove = useCallback(
    async (slotId: string, newDate: string) => {
      try {
        await moveSlot(slotId, newDate);
      } catch (err) {
        console.error('Failed to move slot:', err);
      }
    },
    [moveSlot]
  );

  const handleBulkApproveScripts = useCallback(async () => {
    setBulkLoading('approve');
    try {
      const scriptedSlots = slots.filter((s) => s.status === 'scripted');
      for (const slot of scriptedSlots) {
        await updateSlot(slot.id, { status: 'in_production' });
      }
    } catch (err) {
      console.error('Failed to bulk approve:', err);
    } finally {
      setBulkLoading(null);
    }
  }, [slots, updateSlot]);

  const handleBulkProduceVideos = useCallback(async () => {
    setBulkLoading('produce');
    try {
      const readySlots = slots.filter(
        (s) => s.status === 'scripted' || s.status === 'in_production'
      );
      for (const slot of readySlots) {
        await updateSlot(slot.id, { status: 'in_production' });
      }
    } catch (err) {
      console.error('Failed to bulk produce:', err);
    } finally {
      setBulkLoading(null);
    }
  }, [slots, updateSlot]);

  const handleGenerateEmptyScripts = useCallback(async () => {
    setBulkLoading('generate');
    try {
      const emptySlots = slots.filter(
        (s) => s.status === 'planned' && !s.script_id
      );
      for (const slot of emptySlots) {
        await updateSlot(slot.id, { status: 'scripted' });
      }
    } catch (err) {
      console.error('Failed to generate scripts:', err);
    } finally {
      setBulkLoading(null);
    }
  }, [slots, updateSlot]);

  const pendingCount = slots.filter((s) => s.status === 'planned').length;
  const scriptedCount = slots.filter((s) => s.status === 'scripted').length;
  const producingCount = slots.filter((s) => s.status === 'in_production').length;
  const readyCount = slots.filter((s) => s.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/characters/${params.id}`}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Calendar{character ? ` for ${character.name}` : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan, schedule, and track your content production pipeline.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {slots.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="mr-2 text-sm font-medium text-gray-700">
            Quick Actions
          </span>

          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleGenerateEmptyScripts}
              isLoading={bulkLoading === 'generate'}
              disabled={bulkLoading !== null}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
              Generate Scripts ({pendingCount} empty)
            </Button>
          )}

          {scriptedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleBulkApproveScripts}
              isLoading={bulkLoading === 'approve'}
              disabled={bulkLoading !== null}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />
              Approve All Scripts ({scriptedCount})
            </Button>
          )}

          {(scriptedCount > 0 || producingCount > 0) && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleBulkProduceVideos}
              isLoading={bulkLoading === 'produce'}
              disabled={bulkLoading !== null}
            >
              <Video className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
              Produce All Videos
            </Button>
          )}

          <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span>{pendingCount} pending</span>
            <span>{scriptedCount} scripted</span>
            <span>{readyCount} ready</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <DragDropCalendar
            slots={slots}
            onSlotClick={handleSlotClick}
            onSlotMove={handleSlotMove}
          />
        </div>
      )}

      {/* Slot Detail Side Panel / Dialog */}
      <Dialog
        open={showDetailPanel && selectedSlot !== null}
        onClose={() => {
          setShowDetailPanel(false);
          setSelectedSlot(null);
        }}
        className="max-w-md"
      >
        {selectedSlot && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle>{selectedSlot.topic}</DialogTitle>
                  <DialogDescription>
                    Scheduled for{' '}
                    {format(new Date(selectedSlot.scheduled_date), 'MMMM d, yyyy')}
                    {selectedSlot.time_slot && ` at ${selectedSlot.time_slot}`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <Badge
                  variant={
                    selectedSlot.status === 'ready' || selectedSlot.status === 'published'
                      ? 'success'
                      : selectedSlot.status === 'in_production'
                      ? 'warning'
                      : selectedSlot.status === 'scripted'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {selectedSlot.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Platform */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Platform
                </span>
                <span className="text-sm text-gray-900">
                  {selectedSlot.platform === 'all'
                    ? 'All platforms'
                    : selectedSlot.platform.replace('_', ' ')}
                </span>
              </div>

              {/* Hook */}
              {selectedSlot.hook && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Hook</span>
                  <p className="mt-1 rounded-lg bg-indigo-50 p-3 text-sm text-gray-700">
                    {selectedSlot.hook}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                {selectedSlot.script_id && (
                  <Link
                    href={`/dashboard/scripts/${selectedSlot.script_id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    <FileText className="h-4 w-4" />
                    View Script
                  </Link>
                )}
                {selectedSlot.video_id && (
                  <Link
                    href={`/dashboard/videos/${selectedSlot.video_id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-purple-600 hover:bg-purple-50"
                  >
                    <Video className="h-4 w-4" />
                    View Video
                  </Link>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailPanel(false);
                  setSelectedSlot(null);
                }}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (selectedSlot.script_id) {
                    window.location.href = `/dashboard/scripts/${selectedSlot.script_id}`;
                  }
                }}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
