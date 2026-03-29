'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { format } from 'date-fns';
import { ContentSlot } from '@/types';
import { CalendarView } from './calendar-view';
import { ContentSlotCard } from './content-slot';
import { cn } from '@/lib/utils';

interface DragDropCalendarProps {
  slots: ContentSlot[];
  onSlotMove: (slotId: string, newDate: string) => void;
  onSlotClick?: (slot: ContentSlot) => void;
  onDateClick?: (date: Date) => void;
}

// DroppableDay can be used as an alternative to the droppableProps pattern
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DroppableDay({
  dateStr,
  children,
  isOver,
}: {
  dateStr: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: `day-${dateStr}` });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors',
        isOver && 'bg-indigo-50 ring-2 ring-inset ring-indigo-300'
      )}
    >
      {children}
    </div>
  );
}

function DraggableSlot({
  slot,
  onSlotClick,
}: {
  slot: ContentSlot;
  onSlotClick?: (slot: ContentSlot) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: slot.id,
    data: { slot },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'touch-none',
        isDragging && 'opacity-40'
      )}
    >
      <ContentSlotCard
        slot={slot}
        compact
        isDragging={isDragging}
        onClick={() => onSlotClick?.(slot)}
      />
    </div>
  );
}

export function DragDropCalendar({
  slots,
  onSlotMove,
  onSlotClick,
  onDateClick,
}: DragDropCalendarProps) {
  const [activeSlot, setActiveSlot] = useState<ContentSlot | null>(null);
  const [overDayId, setOverDayId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const slotData = event.active.data.current?.slot as ContentSlot | undefined;
      if (slotData) {
        setActiveSlot(slotData);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (event: { over: { id: string | number } | null }) => {
      if (event.over) {
        setOverDayId(String(event.over.id));
      } else {
        setOverDayId(null);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveSlot(null);
      setOverDayId(null);

      if (!over) return;

      const overId = String(over.id);
      if (!overId.startsWith('day-')) return;

      const newDate = overId.replace('day-', '');
      const slotId = String(active.id);
      const slot = slots.find((s) => s.id === slotId);

      if (slot) {
        const slotDate = format(new Date(slot.scheduled_date), 'yyyy-MM-dd');
        if (slotDate !== newDate) {
          onSlotMove(slotId, newDate);
        }
      }
    },
    [slots, onSlotMove]
  );

  const handleDragCancel = useCallback(() => {
    setActiveSlot(null);
    setOverDayId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <CalendarView
        slots={slots}
        onSlotClick={onSlotClick}
        onDateClick={onDateClick}
        renderSlot={(slot) => (
          <DraggableSlot slot={slot} onSlotClick={onSlotClick} />
        )}
        droppableProps={(dateStr) => {
          const isOver = overDayId === `day-${dateStr}`;
          return {
            ref: (el: HTMLElement | null) => {
              if (el) {
                el.setAttribute('data-droppable', dateStr);
              }
            },
            className: cn(
              isOver && 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-300 rounded'
            ),
          };
        }}
      />

      {/* Drag overlay */}
      <DragOverlay>
        {activeSlot ? (
          <div className="w-48 rotate-3 opacity-90">
            <ContentSlotCard slot={activeSlot} compact isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
