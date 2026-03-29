'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { ContentCalendar, ContentSlot, ApiResponse } from '@/types';

export function useCalendar(characterId: string) {
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [slots, setSlots] = useState<ContentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    if (!characterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<
        ApiResponse<{ calendar: ContentCalendar; slots: ContentSlot[] }>
      >(`/api/v1/characters/${characterId}/calendar`);
      setCalendar(data.data.calendar);
      setSlots(data.data.slots);
    } catch (err) {
      setError('Failed to load calendar');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const updateSlot = async (
    slotId: string,
    updates: Partial<ContentSlot>
  ): Promise<void> => {
    const { data } = await api.patch<ApiResponse<ContentSlot>>(
      `/api/v1/content-slots/${slotId}`,
      updates
    );
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? data.data : s))
    );
  };

  const moveSlot = async (
    slotId: string,
    newDate: string
  ): Promise<void> => {
    await updateSlot(slotId, { scheduled_date: newDate });
  };

  return {
    calendar,
    slots,
    isLoading,
    error,
    fetchCalendar,
    updateSlot,
    moveSlot,
  };
}
