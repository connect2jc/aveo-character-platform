'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/calendar/calendar-view';
import { Skeleton } from '@/components/ui/skeleton';
import { useCalendar } from '@/hooks/use-calendar';
import { useCharacter } from '@/hooks/use-characters';

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { character } = useCharacter(params.id);
  const { slots, isLoading } = useCalendar(params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/characters/${params.id}`}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Calendar{character ? ` - ${character.name}` : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan and schedule your content production.
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <CalendarView
            slots={slots}
            onSlotClick={(slot) => {
              if (slot.script_id) {
                window.location.href = `/dashboard/scripts/${slot.script_id}`;
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
