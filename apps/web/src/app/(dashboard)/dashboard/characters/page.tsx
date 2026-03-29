'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/characters/character-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useCharacters } from '@/hooks/use-characters';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export default function CharactersPage() {
  const { characters, isLoading, error, deleteCharacter } = useCharacters();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredCharacters = statusFilter === 'all'
    ? characters
    : characters.filter((c) => c.status === statusFilter);

  const statusCounts = {
    all: characters.length,
    ACTIVE: characters.filter((c) => c.status === 'ACTIVE').length,
    DRAFT: characters.filter((c) => c.status === 'DRAFT').length,
    ARCHIVED: characters.filter((c) => c.status === 'ARCHIVED').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your AI characters and their content.
          </p>
        </div>
        <Link href="/dashboard/characters/new">
          <Button className="shadow-md shadow-indigo-200">
            <Plus className="mr-2 h-4 w-4" />
            New Character
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      {characters.length > 0 && (
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {(['all', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                statusFilter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="capitalize">{status}</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                statusFilter === status
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-200 text-gray-500'
              )}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCharacters.length === 0 && characters.length > 0 ? (
        /* Empty Filtered State */
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gray-50/50 py-16">
          <Filter className="h-10 w-10 text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            No {statusFilter} characters
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No characters match the selected filter.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setStatusFilter('all')}
          >
            Show All Characters
          </Button>
        </div>
      ) : characters.length === 0 ? (
        /* Empty State (New User) */
        <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-100/30 blur-3xl" />

          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="relative mt-6 text-xl font-bold text-gray-900">Create your first character</h3>
          <p className="relative mt-2 max-w-sm text-center text-sm text-gray-500">
            Design an AI character with a unique personality, voice, and visual style. Start producing engaging content in minutes.
          </p>
          <Link href="/dashboard/characters/new" className="relative mt-6">
            <Button size="lg" className="shadow-md shadow-indigo-200">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Character
            </Button>
          </Link>
        </div>
      ) : (
        /* Character Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
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
