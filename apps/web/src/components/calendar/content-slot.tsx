'use client';

import { Badge } from '@/components/ui/badge';
import { ContentSlot } from '@/types';
import { cn } from '@/lib/utils';

interface ContentSlotCardProps {
  slot: ContentSlot;
  compact?: boolean;
  onClick?: () => void;
}

const statusColors: Record<ContentSlot['status'], string> = {
  planned: 'bg-gray-400',
  scripted: 'bg-blue-400',
  in_production: 'bg-yellow-400',
  ready: 'bg-green-400',
  published: 'bg-purple-400',
};

export function ContentSlotCard({ slot, compact, onClick }: ContentSlotCardProps) {
  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-xs hover:bg-indigo-50"
      >
        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', statusColors[slot.status])} />
        <span className="truncate text-gray-700">{slot.topic}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{slot.topic}</h4>
          {slot.hook && (
            <p className="mt-1 text-xs text-gray-500">{slot.hook}</p>
          )}
        </div>
        <Badge
          variant={
            slot.status === 'ready' || slot.status === 'published'
              ? 'success'
              : slot.status === 'in_production'
              ? 'warning'
              : 'secondary'
          }
        >
          {slot.status.replace('_', ' ')}
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>{slot.platform === 'all' ? 'All platforms' : slot.platform}</span>
        {slot.time_slot && <span>{slot.time_slot}</span>}
      </div>
    </div>
  );
}
