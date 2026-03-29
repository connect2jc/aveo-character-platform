'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDuration, cn } from '@/lib/utils';
import {
  Save,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  FileText,
  MessageSquare,
  Zap,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Character } from '@/types';

const scriptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  hook: z.string().min(1, 'Hook is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  cta: z.string().min(1, 'CTA is required'),
});

type ScriptFormData = z.infer<typeof scriptSchema>;

interface ScriptEditorProps {
  initialData?: Partial<
    ScriptFormData & {
      duration_estimate: number;
      version: number;
      status: string;
      revision_notes?: string;
    }
  >;
  character?: Character | null;
  onSubmit: (data: ScriptFormData) => void;
  onApprove?: () => void;
  onReject?: (notes: string) => void;
  onRegenerate?: (params: RegenerateParams) => void;
  isLoading?: boolean;
}

interface RegenerateParams {
  tone: string;
  hookStyle: string;
  targetDuration: number;
  notes: string;
}

export function ScriptEditor({
  initialData,
  character,
  onSubmit,
  onApprove,
  onReject,
  onRegenerate,
  isLoading,
}: ScriptEditorProps) {
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [regenParams, setRegenParams] = useState<RegenerateParams>({
    tone: 'engaging',
    hookStyle: 'question',
    targetDuration: 60,
    notes: '',
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: initialData,
  });

  const hookText = watch('hook') || '';
  const body = watch('body') || '';
  const ctaText = watch('cta') || '';
  const fullText = `${hookText} ${body} ${ctaText}`;
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 2.5); // ~150 words per minute

  const statusVariant =
    initialData?.status === 'approved'
      ? 'success'
      : initialData?.status === 'revision_needed'
      ? 'warning'
      : 'secondary';

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Script Editor</CardTitle>
                  {initialData?.status && (
                    <Badge variant={statusVariant}>
                      {initialData.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {initialData?.version && <span>v{initialData.version}</span>}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{formatDuration(estimatedDuration)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form id="script-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Title"
                  placeholder="Script title"
                  error={errors.title?.message}
                  {...register('title')}
                />

                {/* Hook section */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Zap className="h-3.5 w-3.5 text-indigo-500" />
                      Hook (first 3 seconds)
                    </label>
                    <span className="text-xs text-gray-400">
                      {hookText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    className={cn(
                      'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                      errors.hook
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-indigo-500'
                    )}
                    placeholder="Grab attention immediately..."
                    {...register('hook')}
                  />
                  {errors.hook && (
                    <p className="mt-1 text-sm text-red-600">{errors.hook.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    This is the most important part. Make it impossible to scroll past.
                  </p>
                </div>

                {/* Body section */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <FileText className="h-3.5 w-3.5 text-gray-500" />
                      Body
                    </label>
                    <span className="text-xs text-gray-400">
                      {body.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    className={cn(
                      'flex min-h-[200px] w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                      errors.body
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-indigo-500'
                    )}
                    placeholder="Main content of the script..."
                    {...register('body')}
                  />
                  {errors.body && (
                    <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
                  )}
                </div>

                {/* CTA section */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                      Call to Action
                    </label>
                    <span className="text-xs text-gray-400">
                      {ctaText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    className={cn(
                      'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                      errors.cta
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-indigo-500'
                    )}
                    placeholder="End with a strong CTA..."
                    {...register('cta')}
                  />
                  {errors.cta && (
                    <p className="mt-1 text-sm text-red-600">{errors.cta.message}</p>
                  )}
                </div>
              </form>

              {/* Revision notes display */}
              {initialData?.revision_notes && (
                <div className="mt-4 rounded-lg bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    Revision Notes
                  </div>
                  <p className="mt-1 text-sm text-orange-600">
                    {initialData.revision_notes}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{wordCount} total words</span>
                  <span>~{formatDuration(estimatedDuration)} duration</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onRegenerate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegenDialog(true)}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  )}
                  {onApprove && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={onApprove}
                      disabled={isLoading}
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                  <Button
                    type="submit"
                    form="script-form"
                    size="sm"
                    isLoading={isLoading}
                    disabled={!isDirty}
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Character voice sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-indigo-500" />
                Character Voice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {character ? (
                <>
                  <div className="flex items-center gap-3">
                    {character.base_image_url ? (
                      <img
                        src={character.base_image_url}
                        alt={character.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {character.name}
                      </p>
                      <p className="text-xs text-gray-500">{character.niche}</p>
                    </div>
                  </div>

                  {character.personality_traits.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Personality
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {character.personality_traits.map((trait) => (
                          <Badge key={trait} variant="secondary" className="text-[10px]">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.speaking_style && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Speaking Style
                      </p>
                      <p className="text-sm text-gray-600">
                        {character.speaking_style}
                      </p>
                    </div>
                  )}

                  {character.target_audience && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Target Audience
                      </p>
                      <p className="text-sm text-gray-600">
                        {character.target_audience}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-700">
                      Writing Tips
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-amber-600">
                      <li>Write in the character&apos;s voice and tone</li>
                      <li>Keep sentences short and punchy</li>
                      <li>Use conversational language</li>
                      <li>Avoid jargon unless the niche demands it</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-gray-400">
                  <User className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2">No character info available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Script Quality Indicator */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Script Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QualityIndicator
                label="Hook Strength"
                value={hookText.length > 20 ? 'Good' : hookText.length > 0 ? 'Short' : 'Missing'}
                status={hookText.length > 20 ? 'good' : hookText.length > 0 ? 'warn' : 'bad'}
              />
              <QualityIndicator
                label="Body Length"
                value={
                  wordCount > 40
                    ? 'Good'
                    : wordCount > 15
                    ? 'Short'
                    : 'Too short'
                }
                status={wordCount > 40 ? 'good' : wordCount > 15 ? 'warn' : 'bad'}
              />
              <QualityIndicator
                label="CTA Present"
                value={ctaText.length > 5 ? 'Yes' : 'Missing'}
                status={ctaText.length > 5 ? 'good' : 'bad'}
              />
              <QualityIndicator
                label="Duration"
                value={formatDuration(estimatedDuration)}
                status={
                  estimatedDuration >= 30 && estimatedDuration <= 90
                    ? 'good'
                    : estimatedDuration > 0
                    ? 'warn'
                    : 'bad'
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regenerate Dialog */}
      <Dialog open={showRegenDialog} onClose={() => setShowRegenDialog(false)}>
        <DialogHeader>
          <DialogTitle>Regenerate Script</DialogTitle>
          <DialogDescription>
            Adjust parameters before generating a new version of this script.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={regenParams.tone}
              onChange={(e) =>
                setRegenParams((p) => ({ ...p, tone: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="engaging">Engaging</option>
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
              <option value="provocative">Provocative</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Hook Style
            </label>
            <select
              value={regenParams.hookStyle}
              onChange={(e) =>
                setRegenParams((p) => ({ ...p, hookStyle: e.target.value }))
              }
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="question">Question</option>
              <option value="statistic">Shocking Statistic</option>
              <option value="story">Mini Story</option>
              <option value="challenge">Challenge</option>
              <option value="controversial">Controversial Take</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Target Duration (seconds)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              value={regenParams.targetDuration}
              onChange={(e) =>
                setRegenParams((p) => ({
                  ...p,
                  targetDuration: parseInt(e.target.value) || 60,
                }))
              }
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              value={regenParams.notes}
              onChange={(e) =>
                setRegenParams((p) => ({ ...p, notes: e.target.value }))
              }
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Any specific direction or references for regeneration..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRegenDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onRegenerate?.(regenParams);
              setShowRegenDialog(false);
            }}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Regenerate
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
        <DialogHeader>
          <DialogTitle>Reject Script</DialogTitle>
          <DialogDescription>
            Provide notes on what needs to change.
          </DialogDescription>
        </DialogHeader>

        <div>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="What needs to be improved..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onReject?.(rejectNotes);
              setShowRejectDialog(false);
              setRejectNotes('');
            }}
            disabled={!rejectNotes.trim()}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Reject with Notes
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function QualityIndicator({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'warn' | 'bad';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-xs font-medium',
          status === 'good' && 'bg-green-100 text-green-700',
          status === 'warn' && 'bg-yellow-100 text-yellow-700',
          status === 'bad' && 'bg-red-100 text-red-700'
        )}
      >
        {value}
      </span>
    </div>
  );
}
