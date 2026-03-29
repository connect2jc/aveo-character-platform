'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScriptEditor } from '@/components/scripts/script-editor';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { Script, ApiResponse } from '@/types';

export default function ScriptDetailPage({ params }: { params: { id: string } }) {
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<Script>>(`/api/v1/scripts/${params.id}`)
      .then(({ data }) => setScript(data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {script?.title || 'Script Editor'}
        </h1>
      </div>

      <ScriptEditor
        initialData={script || undefined}
        onSubmit={(data) => {
          console.log('Submit script:', data);
        }}
      />
    </div>
  );
}
