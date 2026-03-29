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
import { cn } from '@/lib/utils';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  renderDay?: (date: Date) => React.ReactNode;
}

function Calendar({ selected, onSelect, className, renderDay }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onSelect?.(day)}
            className={cn(
              'relative flex min-h-[40px] flex-col items-center rounded-lg p-2 text-sm transition-colors',
              !isSameMonth(day, currentMonth) && 'text-gray-300',
              isSameMonth(day, currentMonth) && 'text-gray-700 hover:bg-gray-50',
              selected && isSameDay(day, selected) && 'bg-indigo-600 text-white hover:bg-indigo-700',
              isSameDay(day, new Date()) && !selected && 'font-bold text-indigo-600'
            )}
          >
            {format(day, 'd')}
            {renderDay?.(day)}
          </button>
        ))}
      </div>
    </div>
  );
}

export { Calendar };
