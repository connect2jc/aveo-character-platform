'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Video,
  FileText,
  Edit2,
  Save,
  X,
  Play,
  Image,
  Mic,
  Volume2,
  Shield,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VariationGallery } from '@/components/characters/variation-gallery';
import { useCharacter } from '@/hooks/use-characters';
import { cn } from '@/lib/utils';

export default function CharacterDetailPage({ params }: { params: { id: string } }) {
  const { character, isLoading } = useCharacter(params.id);
  const [isEditing, setIsEditing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<'active' | 'draft' | 'archived' | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <X className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Character not found</h2>
        <p className="mt-1 text-sm text-gray-500">This character may have been deleted or moved.</p>
        <Link href="/dashboard/characters">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatus = activeStatus || character.status;

  const statusConfig = {
    draft: { variant: 'secondary' as const, label: 'Draft', dot: 'bg-gray-400' },
    active: { variant: 'success' as const, label: 'Active', dot: 'bg-green-500' },
    archived: { variant: 'warning' as const, label: 'Archived', dot: 'bg-yellow-500' },
  };

  const sConfig = statusConfig[currentStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/characters" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            {character.base_image_url ? (
              <img
                src={character.base_image_url}
                alt={character.name}
                className="h-14 w-14 rounded-xl object-cover shadow-md ring-2 ring-white"
              />
            ) : (
              <Avatar name={character.name} size="lg" className="h-14 w-14 text-lg shadow-md ring-2 ring-white" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{character.name}</h1>
                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1">
                  <span className={cn('h-2 w-2 rounded-full', sConfig.dot)} />
                  <span className="text-xs font-medium text-gray-600">{sConfig.label}</span>
                </div>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{character.niche}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(['active', 'draft', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  currentStatus === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <Link href={`/dashboard/calendar/${character.id}`}>
            <Button variant="outline" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </Link>
          <Button size="sm">
            <Video className="mr-2 h-4 w-4" />
            Generate Video
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Character Profile Card */}
                <div className="lg:col-span-1 space-y-4">
                  <Card>
                    <CardContent className="flex flex-col items-center py-8">
                      {character.base_image_url ? (
                        <img
                          src={character.base_image_url}
                          alt={character.name}
                          className="h-28 w-28 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-50"
                        />
                      ) : (
                        <Avatar
                          name={character.name}
                          size="lg"
                          className="h-28 w-28 text-3xl shadow-lg ring-4 ring-indigo-50"
                        />
                      )}
                      <h3 className="mt-4 text-lg font-bold text-gray-900">{character.name}</h3>
                      <span className="mt-1 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700">
                        {character.niche}
                      </span>

                      {character.personality_traits.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                          {character.personality_traits.map((trait) => (
                            <span
                              key={trait}
                              className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}

                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-6"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="mr-2 h-3.5 w-3.5" />
                          Edit Character
                        </Button>
                      )}
                      {isEditing && (
                        <div className="mt-6 flex gap-2">
                          <Button size="sm" onClick={() => setIsEditing(false)}>
                            <Save className="mr-2 h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Backstory */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        Backstory & Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <textarea
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          rows={4}
                          defaultValue={character.description || ''}
                          placeholder="Enter character backstory and description..."
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-700">
                          {character.description || 'No backstory defined yet. Edit this character to add a compelling backstory.'}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Volume2 className="h-4 w-4" />
                          Speaking Style
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            defaultValue={character.speaking_style || ''}
                            placeholder="e.g., Casual and energetic"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {character.speaking_style || 'Not specified'}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                          <Shield className="h-4 w-4" />
                          Target Audience
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            defaultValue={character.target_audience || ''}
                            placeholder="e.g., Young professionals, 25 to 35"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {character.target_audience || 'Not specified'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Voice Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-indigo-500" />
                        Voice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {character.voice_id ? (
                        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-200">
                            <Play className="h-5 w-5 ml-0.5" />
                          </button>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Voice ID: {character.voice_id}</p>
                            {character.voice_settings && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                Stability: {Math.round(character.voice_settings.stability * 100)}% | Similarity: {Math.round(character.voice_settings.similarity_boost * 100)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-4">
                          <p className="text-sm text-gray-500">No voice selected for this character.</p>
                          <Button variant="outline" size="sm">Select Voice</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            id: 'variations',
            label: 'Variations',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-indigo-500" />
                      Visual Variations
                    </CardTitle>
                    <Button size="sm">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Variations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <VariationGallery
                    variations={[]}
                    onAddNew={() => {}}
                    onApprove={() => {}}
                    onRegenerate={() => {}}
                    onDelete={() => {}}
                  />
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'voice',
            label: 'Voice',
            content: (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-indigo-500" />
                    Voice Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {character.voice_id ? (
                    <div className="space-y-6">
                      {/* Voice Preview */}
                      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                        <div className="flex items-center gap-4">
                          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
                            <Play className="h-6 w-6 ml-0.5" />
                          </button>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Current Voice</p>
                            <p className="text-xs text-gray-500">Voice ID: {character.voice_id}</p>
                            {/* Waveform Visualization */}
                            <div className="mt-2 flex items-end gap-0.5 h-6">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 rounded-full bg-indigo-300"
                                  style={{ height: `${4 + Math.sin(i * 0.5) * 12 + Math.random() * 8}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Voice Settings */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stability</label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{ width: `${(character.voice_settings?.stability || 0.75) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round((character.voice_settings?.stability || 0.75) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Similarity</label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${(character.voice_settings?.similarity_boost || 0.75) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round((character.voice_settings?.similarity_boost || 0.75) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Test with custom text */}
                      <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test with custom text</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type something to test the voice..."
                            className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                        <Mic className="h-8 w-8 text-indigo-500" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-gray-900">No voice selected</h3>
                      <p className="mt-1 text-sm text-gray-500">Choose a voice for this character to enable audio generation.</p>
                      <Button className="mt-4">Select Voice</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'scripts',
            label: 'Scripts',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      Scripts
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      New Script
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                      <FileText className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">No scripts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Scripts will appear here once generated from the content calendar.
                    </p>
                    <Link href={`/dashboard/calendar/${character.id}`}>
                      <Button variant="outline" className="mt-4">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Go to Calendar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'videos',
            label: 'Videos',
            content: (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-indigo-500" />
                      Videos
                    </CardTitle>
                    <Button size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                      <Video className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-gray-900">No videos yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Generated videos for this character will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
