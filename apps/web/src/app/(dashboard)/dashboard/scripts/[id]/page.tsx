'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Volume2,
  Pencil,
  Eye,
  Calendar,
  LinkIcon,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScriptEditor } from '@/components/scripts/script-editor';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { Script, Character, ApiResponse } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';

export default function ScriptDetailPage({ params }: { params: { id: string } }) {
  const [script, setScript] = useState<Script | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<Script>>(`/api/v1/scripts/${params.id}`)
      .then(({ data }) => {
        setScript(data.data);
        // Fetch character for voice info
        if (data.data.character_id) {
          api
            .get<ApiResponse<Character>>(
              `/api/v1/characters/${data.data.character_id}`
            )
            .then(({ data: charData }) => setCharacter(charData.data))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const handleSave = async (data: { title: string; hook: string; body: string; cta: string }) => {
    setIsSaving(true);
    try {
      const { data: res } = await api.patch<ApiResponse<Script>>(
        `/api/v1/scripts/${params.id}`,
        data
      );
      setScript(res.data);
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to save script:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.patch<ApiResponse<Script>>(
        `/api/v1/scripts/${params.id}`,
        { status: 'approved' }
      );
      setScript(data.data);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (notes: string) => {
    setIsSaving(true);
    try {
      const { data } = await api.patch<ApiResponse<Script>>(
        `/api/v1/scripts/${params.id}`,
        { status: 'revision_needed', revision_notes: notes }
      );
      setScript(data.data);
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async (regenParams: {
    tone: string;
    hookStyle: string;
    targetDuration: number;
    notes: string;
  }) => {
    setIsSaving(true);
    try {
      const { data } = await api.post<ApiResponse<Script>>(
        `/api/v1/scripts/${params.id}/regenerate`,
        regenParams
      );
      setScript(data.data);
    } catch (err) {
      console.error('Failed to regenerate:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoicePreview = async () => {
    setIsVoiceTesting(true);
    try {
      const { data } = await api.post<ApiResponse<{ audio_url: string }>>(
        `/api/v1/scripts/${params.id}/test-voice`,
        {}
      );
      const audio = new Audio(data.data.audio_url);
      audio.play();
    } catch (err) {
      console.error('Failed to play voice preview:', err);
    } finally {
      setIsVoiceTesting(false);
    }
  };

  const handleCopyScript = () => {
    if (!script) return;
    const fullText = `${script.hook}\n\n${script.body}\n\n${script.cta}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64 lg:col-span-1" />
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex flex-col items-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">Script not found</h2>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const statusVariant =
    script.status === 'approved'
      ? 'success'
      : script.status === 'revision_needed'
      ? 'warning'
      : 'secondary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded-lg p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {script.title}
              </h1>
              <Badge variant={statusVariant}>
                {script.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>v{script.version}</span>
              <span>~{formatDuration(script.duration_estimate)}</span>
              <span>Created {formatDate(script.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoicePreview}
            isLoading={isVoiceTesting}
          >
            <Volume2 className="mr-1.5 h-4 w-4" />
            Voice Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyScript}
          >
            {copied ? (
              <Check className="mr-1.5 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-1.5 h-4 w-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Eye className="mr-1.5 h-4 w-4" />
                View Mode
              </>
            ) : (
              <>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isEditMode ? (
        <ScriptEditor
          initialData={script}
          character={character}
          onSubmit={handleSave}
          onApprove={handleApprove}
          onReject={handleReject}
          onRegenerate={handleRegenerate}
          isLoading={isSaving}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Script content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="space-y-6 py-6">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Hook
                  </h4>
                  <p className="rounded-lg bg-indigo-50 p-4 text-sm leading-relaxed text-gray-800">
                    {script.hook}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Body
                  </h4>
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
                    {script.body}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-600">
                    Call to Action
                  </h4>
                  <p className="rounded-lg bg-green-50 p-4 text-sm leading-relaxed text-gray-800">
                    {script.cta}
                  </p>
                </div>

                {script.revision_notes && (
                  <div className="rounded-lg bg-orange-50 p-4">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
                      Revision Notes
                    </h4>
                    <p className="text-sm text-orange-700">
                      {script.revision_notes}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      {script.full_script.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span>~{formatDuration(script.duration_estimate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {script.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={handleApprove}
                        disabled={isSaving}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <Badge variant={statusVariant}>
                        {script.status.replace('_', ' ')}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-500">Version</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {script.version}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-500">Duration</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDuration(script.duration_estimate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(script.created_at)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-500">Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(script.updated_at)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Associated content slot */}
            {script.content_slot_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    Content Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/calendar/${script.character_id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    <LinkIcon className="h-4 w-4" />
                    View in Calendar
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Character info */}
            {character && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Character</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {character.baseImageUrl ? (
                      <img
                        src={character.baseImageUrl}
                        alt={character.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                        {character.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {character.name}
                      </p>
                      <p className="text-xs text-gray-500">{character.niche}</p>
                    </div>
                  </div>
                  {character.speakingStyle && (
                    <p className="mt-3 text-xs text-gray-500">
                      {character.speakingStyle}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Generation info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RefreshCw className="h-4 w-4 text-indigo-500" />
                  Generation Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Method</dt>
                    <dd className="font-medium text-gray-900">
                      {script.version > 1 ? 'Regenerated' : 'AI Generated'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Iterations</dt>
                    <dd className="font-medium text-gray-900">
                      {script.version}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
