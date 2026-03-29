'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Character } from '@/types';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data: { characters: Character[]; total: number } }>(
        '/api/v1/characters'
      );
      setCharacters(data.data.characters || []);
    } catch (err) {
      setError('Failed to load characters');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const createCharacter = async (
    character: Partial<Character>
  ): Promise<Character> => {
    const { data } = await api.post<{ success: boolean; data: { character: Character } }>(
      '/api/v1/characters',
      character
    );
    setCharacters((prev) => [...prev, data.data.character]);
    return data.data.character;
  };

  const updateCharacter = async (
    id: string,
    updates: Partial<Character>
  ): Promise<Character> => {
    const { data } = await api.patch<{ success: boolean; data: { character: Character } }>(
      `/api/v1/characters/${id}`,
      updates
    );
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? data.data.character : c))
    );
    return data.data.character;
  };

  const deleteCharacter = async (id: string): Promise<void> => {
    await api.delete(`/api/v1/characters/${id}`);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    characters,
    isLoading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}

export function useCharacter(id: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .get<{ success: boolean; data: { character: Character } }>(`/api/v1/characters/${id}`)
      .then(({ data }) => setCharacter(data.data.character))
      .catch(() => setError('Failed to load character'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { character, isLoading, error, setCharacter };
}
