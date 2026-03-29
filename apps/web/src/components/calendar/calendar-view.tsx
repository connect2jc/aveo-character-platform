'use client';

import { useState, useMemo } from 'react';
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
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  LayoutGrid,
} from 'lucide-react';
import { ContentSlot } from '@/types';
import { ContentSlotCard } from './content-slot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'list';

interface CalendarViewProps {
  slots: ContentSlot[];
  onSlotClick?: (slot: ContentSlot) => void;
  onDateClick?: (date: Date) => void;
  onSlotMove?: (slotId: string, newDate: string) => void;
  droppableProps?: (dateStr: string) => Record<string, unknown>;
  renderSlot?: (slot: ContentSlot) => React.ReactNode;
}

const statusLegend = [
  { label: 'Pending', color: 'bg-gray-400' },
  { label: 'Scripted', color: 'bg-blue-400' },
  { label: 'Producing', color: 'bg-yellow-400' },
  { label: 'Ready', color: 'bg-green-400' },
  { label: 'Published', color: 'bg-purple-400' },
];

export function CalendarView({
  slots,
  onSlotClick,
  onDateClick,
  droppableProps,
  renderSlot,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week view: show current week only
  const weekStart = startOfWeek(currentMonth);
  const weekEnd = endOfWeek(currentMonth);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getSlotsForDay = (date: Date) =>
    slots.filter((s) => isSameDay(new Date(s.scheduled_date), date));

  // Stats for the month
  const monthStats = useMemo(() => {
    const monthSlots = slots.filter((s) => {
      const d = new Date(s.scheduled_date);
      return d >= monthStart && d <= monthEnd;
    });
    return {
      total: monthSlots.length,
      planned: monthSlots.filter((s) => s.status === 'planned').length,
      scripted: monthSlots.filter((s) => s.status === 'scripted').length,
      in_production: monthSlots.filter((s) => s.status === 'in_production').length,
      ready: monthSlots.filter((s) => s.status === 'ready').length,
      published: monthSlots.filter((s) => s.status === 'published').length,
    };
  }, [slots, monthStart, monthEnd]);

  // List view: sorted by date
  const listSlots = useMemo(() => {
    return slots
      .filter((s) => {
        const d = new Date(s.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime()
      );
  }, [slots, monthStart, monthEnd]);

  const renderDayCell = (day: Date, isWeekView = false) => {
    const daySlots = getSlotsForDay(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const extra = droppableProps ? droppableProps(dateStr) : {};

    return (
      <div
        key={day.toISOString()}
        onClick={() => onDateClick?.(day)}
        {...extra}
        className={cn(
          'cursor-pointer border-b border-r border-gray-200 p-2 transition-colors hover:bg-gray-50/80',
          isWeekView ? 'min-h-[200px]' : 'min-h-[120px]',
          !isSameMonth(day, currentMonth) && !isWeekView && 'bg-gray-50/50 text-gray-300',
          isToday(day) && 'bg-indigo-50/30'
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
              isToday(day) &&
                'bg-indigo-600 font-semibold text-white',
              !isToday(day) &&
                isSameMonth(day, currentMonth) &&
                'text-gray-900',
              !isSameMonth(day, currentMonth) && 'text-gray-300'
            )}
          >
            {format(day, 'd')}
          </span>
          {daySlots.length > 0 && (
            <span className="text-[10px] font-medium text-gray-400">
              {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="mt-1 space-y-0.5">
          {daySlots.slice(0, isWeekView ? 6 : 3).map((slot) =>
            renderSlot ? (
              <div key={slot.id}>{renderSlot(slot)}</div>
            ) : (
              <ContentSlotCard
                key={slot.id}
                slot={slot}
                compact
                onClick={() => onSlotClick?.(slot)}
              />
            )
          )}
          {daySlots.length > (isWeekView ? 6 : 3) && (
            <p className="px-1.5 text-[10px] font-medium text-indigo-500">
              +{daySlots.length - (isWeekView ? 6 : 3)} more
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium">
              {monthStats.total} total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="hidden items-center rounded-lg border border-gray-200 p-0.5 sm:flex">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'month'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="Month view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'week'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="Week view"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {statusLegend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Mobile: always show list view */}
      <div className="sm:hidden">
        {listSlots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              No content scheduled this month
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {listSlots.map((slot) => {
              const date = new Date(slot.scheduled_date);
              return (
                <div key={slot.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1 text-center">
                    <div className="text-xs font-medium text-gray-400">
                      {format(date, 'EEE')}
                    </div>
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                        isToday(date)
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-900'
                      )}
                    >
                      {format(date, 'd')}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <ContentSlotCard
                      slot={slot}
                      onClick={() => onSlotClick?.(slot)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop calendar views */}
      <div className="hidden sm:block">
        {viewMode === 'list' ? (
          /* List view */
          <div className="space-y-1">
            {listSlots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  No content scheduled this month
                </p>
              </div>
            ) : (
              listSlots.map((slot) => {
                const date = new Date(slot.scheduled_date);
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="w-16 flex-shrink-0 text-center">
                      <div className="text-xs text-gray-400">
                        {format(date, 'EEE')}
                      </div>
                      <div
                        className={cn(
                          'text-lg font-semibold',
                          isToday(date) ? 'text-indigo-600' : 'text-gray-900'
                        )}
                      >
                        {format(date, 'd')}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <ContentSlotCard
                        slot={slot}
                        onClick={() => onSlotClick?.(slot)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : viewMode === 'week' ? (
          /* Week view */
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {day}
              </div>
            ))}
            {weekDays.map((day) => renderDayCell(day, true))}
          </div>
        ) : (
          /* Month grid view */
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {day}
              </div>
            ))}
            {days.map((day) => renderDayCell(day))}
          </div>
        )}
      </div>

      {/* Month stats bar */}
      {monthStats.total > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium text-gray-500">Status breakdown:</span>
          <div className="flex flex-1 items-center gap-3">
            {monthStats.planned > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {monthStats.planned} pending
              </Badge>
            )}
            {monthStats.scripted > 0 && (
              <Badge className="bg-blue-100 text-blue-800 text-[10px]">
                {monthStats.scripted} scripted
              </Badge>
            )}
            {monthStats.in_production > 0 && (
              <Badge variant="warning" className="text-[10px]">
                {monthStats.in_production} producing
              </Badge>
            )}
            {monthStats.ready > 0 && (
              <Badge variant="success" className="text-[10px]">
                {monthStats.ready} ready
              </Badge>
            )}
            {monthStats.published > 0 && (
              <Badge className="bg-purple-100 text-purple-800 text-[10px]">
                {monthStats.published} published
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
