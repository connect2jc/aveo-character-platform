'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CharacterWizard } from '@/components/characters/character-wizard';
import { useCharacters } from '@/hooks/use-characters';

export default function NewCharacterPage() {
  const router = useRouter();
  const { createCharacter } = useCharacters();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    niche: string;
    age_range_min: number;
    age_range_max: number;
    pain_points: string[];
    desires?: string;
    name: string;
    age: number;
    gender: string;
    emotional_role: string;
    warmth: number;
    energy: number;
    authority: number;
    personality_tags: string[];
  }) => {
    setIsLoading(true);
    try {
      const character = await createCharacter({
        name: data.name,
        niche: data.niche,
        targetAudience: `${data.age_range_min}-${data.age_range_max} year olds. Pain points: ${data.pain_points.join(', ')}${data.desires ? '. Desires: ' + data.desires : ''}`,
      } as Parameters<typeof createCharacter>[0]);
      toast.success('Character created successfully!');
      router.push(`/dashboard/characters/${character.id}`);
    } catch {
      toast.error('Failed to create character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Character</h1>
        <p className="mt-1 text-sm text-gray-500">
          Build your AI character step by step.
        </p>
      </div>

      <CharacterWizard onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
