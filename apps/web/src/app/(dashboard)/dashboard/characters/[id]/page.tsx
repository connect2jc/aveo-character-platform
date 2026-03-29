'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, Video, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCharacter } from '@/hooks/use-characters';

export default function CharacterDetailPage({ params }: { params: { id: string } }) {
  const { character, isLoading } = useCharacter(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">Character not found</h2>
        <Link href="/dashboard/characters">
          <Button variant="outline" className="mt-4">Back to Characters</Button>
        </Link>
      </div>
    );
  }

  const statusVariant = {
    draft: 'secondary' as const,
    active: 'success' as const,
    archived: 'warning' as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/characters" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{character.name}</h1>
            <Badge variant={statusVariant[character.status]}>{character.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">{character.niche}</p>
        </div>
        <div className="flex gap-2">
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

      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="flex flex-col items-center py-8">
                      <Avatar
                        name={character.name}
                        src={character.base_image_url}
                        size="lg"
                        className="h-24 w-24 text-2xl"
                      />
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500">{character.niche}</p>
                      {character.personality_traits.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                          {character.personality_traits.map((trait) => (
                            <span
                              key={trait}
                              className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {character.description || 'No description set'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Target Audience</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {character.target_audience || 'Not specified'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Speaking Style</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {character.speaking_style || 'Not specified'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Voice</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {character.voice_id || 'No voice selected'}
                          </dd>
                        </div>
                      </dl>
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
                <CardContent className="flex flex-col items-center py-12">
                  <Settings className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">
                    No variations yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generate outfit, expression, and pose variations.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Generate Variations
                  </Button>
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'scripts',
            label: 'Scripts',
            content: (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Settings className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">No scripts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Scripts will appear here once generated from the content calendar.
                  </p>
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'videos',
            label: 'Videos',
            content: (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Video className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">No videos yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Generated videos will appear here.
                  </p>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
