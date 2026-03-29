'use client';

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { ContentSlot } from '@/types';
import { CalendarView } from './calendar-view';

interface DragDropCalendarProps {
  slots: ContentSlot[];
  onSlotMove: (slotId: string, newDate: string) => void;
  onSlotClick?: (slot: ContentSlot) => void;
}

export function DragDropCalendar({ slots, onSlotMove, onSlotClick }: DragDropCalendarProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onSlotMove(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <CalendarView
        slots={slots}
        onSlotClick={onSlotClick}
        onSlotMove={onSlotMove}
      />
    </DndContext>
  );
}
