'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, CalendarDays, Video, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onDelete?: (id: string) => void;
  videoCount?: number;
  scriptCount?: number;
}

export function CharacterCard({ character, onDelete, videoCount = 0, scriptCount = 0 }: CharacterCardProps) {
  const statusConfig = {
    draft: { variant: 'secondary' as const, dot: 'bg-gray-400' },
    active: { variant: 'success' as const, dot: 'bg-green-500' },
    archived: { variant: 'warning' as const, dot: 'bg-yellow-500' },
  };

  const config = statusConfig[character.status];

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardContent className="p-0">
        {/* Character Image with Gradient Overlay */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
          {character.base_image_url ? (
            <img
              src={character.base_image_url}
              alt={character.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-200/50 blur-xl" />
                <Avatar name={character.name} size="lg" className="relative h-20 w-20 text-2xl" />
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Status Indicator */}
          <div className="absolute left-3 top-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              <span className={`h-2 w-2 rounded-full ${config.dot}`} />
              <span className="capitalize text-gray-700">{character.status}</span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-2 top-2 z-10">
            <DropdownMenu
              trigger={
                <button className="rounded-lg bg-white/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white">
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </button>
              }
            >
              <DropdownItem onClick={() => window.location.href = `/dashboard/characters/${character.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownItem>
              <DropdownItem onClick={() => window.location.href = `/dashboard/calendar/${character.id}`}>
                <CalendarDays className="mr-2 h-4 w-4" /> Calendar
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem destructive onClick={() => onDelete?.(character.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownItem>
            </DropdownMenu>
          </div>

          {/* Quick Action Buttons (visible on hover) */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
            <Link
              href={`/dashboard/characters/${character.id}`}
              className="rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              title="View Details"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </Link>
          </div>

          {/* Niche Badge on Image */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {character.niche}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <Link
              href={`/dashboard/characters/${character.id}`}
              className="group/link"
            >
              <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover/link:text-indigo-600">
                {character.name}
              </h3>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Video className="h-3.5 w-3.5" />
              <span>{videoCount} videos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5" />
              <span>{scriptCount} scripts</span>
            </div>
          </div>

          {/* Personality Traits */}
          {character.personality_traits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {character.personality_traits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
                >
                  {trait}
                </span>
              ))}
              {character.personality_traits.length > 3 && (
                <span className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
                  +{character.personality_traits.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
