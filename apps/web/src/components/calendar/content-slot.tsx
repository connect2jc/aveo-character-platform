'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentSlot } from '@/types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Video,
  Pencil,
  Sparkles,
  Music,
  Globe,
  Zap,
  GripVertical,
} from 'lucide-react';

interface ContentSlotCardProps {
  slot: ContentSlot;
  compact?: boolean;
  onClick?: () => void;
  onEditClick?: () => void;
  onGenerateScript?: () => void;
  onViewVideo?: () => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

const statusConfig: Record<
  ContentSlot['status'],
  { color: string; bg: string; text: string; label: string }
> = {
  planned: {
    color: 'bg-gray-400',
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',
    label: 'Pending',
  },
  scripted: {
    color: 'bg-blue-400',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    label: 'Scripted',
  },
  in_production: {
    color: 'bg-yellow-400',
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-700',
    label: 'Producing',
  },
  ready: {
    color: 'bg-green-400',
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    label: 'Ready',
  },
  published: {
    color: 'bg-purple-400',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    label: 'Published',
  },
};

const platformIcons: Record<string, typeof Globe> = {
  tiktok: Music,
  youtube_shorts: Globe,
  instagram_reels: Globe,
  all: Globe,
};

function EmotionalTriggerBadge({ hook }: { hook?: string }) {
  if (!hook) return null;

  const triggers = [
    { keyword: 'fear', label: 'Fear', color: 'bg-red-100 text-red-700' },
    { keyword: 'curiosity', label: 'Curiosity', color: 'bg-blue-100 text-blue-700' },
    { keyword: 'surprise', label: 'Surprise', color: 'bg-amber-100 text-amber-700' },
    { keyword: 'urgency', label: 'Urgency', color: 'bg-orange-100 text-orange-700' },
    { keyword: 'desire', label: 'Desire', color: 'bg-pink-100 text-pink-700' },
    { keyword: 'trust', label: 'Trust', color: 'bg-green-100 text-green-700' },
  ];

  const hookLower = hook.toLowerCase();
  const matched = triggers.find((t) => hookLower.includes(t.keyword));

  if (!matched) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium',
        matched.color
      )}
    >
      <Zap className="h-2.5 w-2.5" />
      {matched.label}
    </span>
  );
}

export function ContentSlotCard({
  slot,
  compact,
  onClick,
  onEditClick,
  onGenerateScript,
  onViewVideo,
  isDragging,
  dragHandleProps,
}: ContentSlotCardProps) {
  const [showActions, setShowActions] = useState(false);
  const config = statusConfig[slot.status];
  const PlatformIcon = platformIcons[slot.platform] || Globe;

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={cn(
          'group/slot flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs transition-all hover:bg-indigo-50',
          isDragging && 'opacity-50'
        )}
      >
        <span
          className={cn('h-2 w-2 rounded-full flex-shrink-0', config.color)}
        />
        <PlatformIcon className="h-3 w-3 flex-shrink-0 text-gray-400" />
        <span className="min-w-0 flex-1 truncate text-gray-700">
          {slot.topic}
        </span>
        <EmotionalTriggerBadge hook={slot.hook} />
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group cursor-pointer rounded-lg border bg-white p-4 transition-all hover:shadow-md',
        isDragging && 'rotate-2 shadow-lg ring-2 ring-indigo-400',
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="mt-0.5 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
              {slot.topic}
            </h4>
            <Badge
              variant={
                slot.status === 'ready' || slot.status === 'published'
                  ? 'success'
                  : slot.status === 'in_production'
                  ? 'warning'
                  : slot.status === 'scripted'
                  ? 'default'
                  : 'secondary'
              }
              className="flex-shrink-0"
            >
              {config.label}
            </Badge>
          </div>

          {slot.hook && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{slot.hook}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <PlatformIcon className="h-3.5 w-3.5" />
              <span>
                {slot.platform === 'all'
                  ? 'All platforms'
                  : slot.platform.replace('_', ' ')}
              </span>
            </div>
            {slot.time_slot && (
              <span className="text-xs text-gray-400">{slot.time_slot}</span>
            )}
            <EmotionalTriggerBadge hook={slot.hook} />
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              {onEditClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick();
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              {onGenerateScript && !slot.script_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateScript();
                  }}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Script
                </Button>
              )}
              {slot.script_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/dashboard/scripts/${slot.script_id}`;
                  }}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Script
                </Button>
              )}
              {onViewVideo && slot.video_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewVideo();
                  }}
                >
                  <Video className="mr-1 h-3 w-3" />
                  Video
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
