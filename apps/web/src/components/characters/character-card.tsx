'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onDelete?: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const statusVariant = {
    draft: 'secondary' as const,
    active: 'success' as const,
    archived: 'warning' as const,
  };

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-100 to-purple-100">
          {character.base_image_url ? (
            <img
              src={character.base_image_url}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Avatar name={character.name} size="lg" />
            </div>
          )}
          <div className="absolute right-2 top-2">
            <DropdownMenu
              trigger={
                <button className="rounded-lg bg-white/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
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
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/dashboard/characters/${character.id}`}
                className="text-base font-semibold text-gray-900 hover:text-indigo-600"
              >
                {character.name}
              </Link>
              <p className="mt-0.5 text-sm text-gray-500">{character.niche}</p>
            </div>
            <Badge variant={statusVariant[character.status]}>
              {character.status}
            </Badge>
          </div>

          {character.personality_traits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {character.personality_traits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {trait}
                </span>
              ))}
              {character.personality_traits.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{character.personality_traits.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
