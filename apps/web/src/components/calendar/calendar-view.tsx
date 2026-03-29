'use client';

import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentSlot } from '@/types';
import { ContentSlotCard } from './content-slot';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  slots: ContentSlot[];
  onSlotClick?: (slot: ContentSlot) => void;
  onDateClick?: (date: Date) => void;
  onSlotMove?: (slotId: string, newDate: string) => void;
}

export function CalendarView({ slots, onSlotClick, onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSlotsForDay = (date: Date) =>
    slots.filter((s) => isSameDay(new Date(s.scheduled_date), date));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const daySlots = getSlotsForDay(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                'min-h-[120px] cursor-pointer border-b border-r border-gray-200 p-2 transition-colors hover:bg-gray-50',
                !isSameMonth(day, currentMonth) && 'bg-gray-50/50 text-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  isSameDay(day, new Date()) && 'bg-indigo-600 font-semibold text-white'
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {daySlots.slice(0, 3).map((slot) => (
                  <ContentSlotCard
                    key={slot.id}
                    slot={slot}
                    compact
                    onClick={() => onSlotClick?.(slot)}
                  />
                ))}
                {daySlots.length > 3 && (
                  <p className="text-xs text-gray-400">+{daySlots.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
