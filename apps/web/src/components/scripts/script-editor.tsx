'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';

const scriptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  hook: z.string().min(1, 'Hook is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  cta: z.string().min(1, 'CTA is required'),
});

type ScriptFormData = z.infer<typeof scriptSchema>;

interface ScriptEditorProps {
  initialData?: Partial<ScriptFormData & { duration_estimate: number; version: number; status: string }>;
  onSubmit: (data: ScriptFormData) => void;
  isLoading?: boolean;
}

export function ScriptEditor({ initialData, onSubmit, isLoading }: ScriptEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: initialData,
  });

  const body = watch('body') || '';
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 2.5); // ~150 words/min

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Script Editor</CardTitle>
          <div className="flex items-center gap-2">
            {initialData?.status && (
              <Badge
                variant={
                  initialData.status === 'approved'
                    ? 'success'
                    : initialData.status === 'revision_needed'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {initialData.status}
              </Badge>
            )}
            {initialData?.version && (
              <span className="text-xs text-gray-400">v{initialData.version}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="script-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Title"
            placeholder="Script title"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Hook (first 3 seconds)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Grab attention immediately..."
              {...register('hook')}
            />
            {errors.hook && <p className="mt-1 text-sm text-red-600">{errors.hook.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Body</label>
            <textarea
              className="flex min-h-[200px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Main content of the script..."
              {...register('body')}
            />
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>{wordCount} words</span>
              <span>~{formatDuration(estimatedDuration)}</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Call to Action
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="End with a strong CTA..."
              {...register('cta')}
            />
            {errors.cta && <p className="mt-1 text-sm text-red-600">{errors.cta.message}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-end gap-3">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" form="script-form" isLoading={isLoading}>
            Submit for Review
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
