'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/characters/character-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useCharacters } from '@/hooks/use-characters';

export default function CharactersPage() {
  const { characters, isLoading, error, deleteCharacter } = useCharacters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your AI characters and their content.
          </p>
        </div>
        <Link href="/dashboard/characters/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Character
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <Plus className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No characters yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first AI character to start producing content.
          </p>
          <Link href="/dashboard/characters/new">
            <Button className="mt-6">Create Your First Character</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={deleteCharacter}
            />
          ))}
        </div>
      )}
    </div>
  );
}
