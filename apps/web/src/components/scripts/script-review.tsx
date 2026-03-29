'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Script } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration, cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Zap,
  MessageSquare,
  ExternalLink,
  CheckSquare,
  Square,
} from 'lucide-react';

type StatusFilter = 'all' | 'draft' | 'approved' | 'revision_needed';

interface ScriptReviewProps {
  scripts: Script[];
  onApprove?: (scriptId: string) => void;
  onReject?: (scriptId: string, notes: string) => void;
  onBatchApprove?: (scriptIds: string[]) => void;
  onBatchReject?: (scriptIds: string[], notes: string) => void;
  isLoading?: boolean;
}

export function ScriptReview({
  scripts,
  onApprove,
  onReject,
  onBatchApprove,
  onBatchReject,
  isLoading,
}: ScriptReviewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [batchRejectNotes, setBatchRejectNotes] = useState('');
  const [showBatchActions, setShowBatchActions] = useState(false);

  const filteredScripts = useMemo(() => {
    if (statusFilter === 'all') return scripts;
    return scripts.filter((s) => s.status === statusFilter);
  }, [scripts, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredScripts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredScripts.map((s) => s.id)));
    }
  };

  const statusCounts = useMemo(() => ({
    all: scripts.length,
    draft: scripts.filter((s) => s.status === 'draft').length,
    approved: scripts.filter((s) => s.status === 'approved').length,
    revision_needed: scripts.filter((s) => s.status === 'revision_needed').length,
  }), [scripts]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success' as const;
      case 'revision_needed':
        return 'warning' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'draft', label: 'Draft' },
              { key: 'approved', label: 'Approved' },
              { key: 'revision_needed', label: 'Needs Revision' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === filter.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {filter.label}
              <span className="ml-1 text-[10px] text-gray-400">
                ({statusCounts[filter.key]})
              </span>
            </button>
          ))}
        </div>

        {/* Batch actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {selectedIds.size} selected
            </span>
            {onBatchApprove && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-green-600 hover:bg-green-50"
                onClick={() => onBatchApprove(Array.from(selectedIds))}
                disabled={isLoading}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Approve Selected
              </Button>
            )}
            {onBatchReject && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:bg-red-50"
                onClick={() => setShowBatchActions(true)}
                disabled={isLoading}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject Selected
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Select All */}
      {filteredScripts.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={toggleSelectAll}
            className="text-gray-400 hover:text-gray-600"
          >
            {selectedIds.size === filteredScripts.length ? (
              <CheckSquare className="h-4 w-4 text-indigo-600" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <span className="text-xs text-gray-500">
            {selectedIds.size === filteredScripts.length
              ? 'Deselect all'
              : 'Select all'}
          </span>
        </div>
      )}

      {/* Script list */}
      {filteredScripts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            No scripts match the current filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScripts.map((script) => {
            const isExpanded = expandedIds.has(script.id);
            const isSelected = selectedIds.has(script.id);

            return (
              <Card
                key={script.id}
                className={cn(
                  'transition-all',
                  isSelected && 'ring-2 ring-indigo-300'
                )}
              >
                <div className="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(script.id)}
                    className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {script.title}
                          </h4>
                          <Badge variant={getStatusVariant(script.status)} className="flex-shrink-0">
                            {script.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(script.duration_estimate)}
                          </span>
                          <span>v{script.version}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link href={`/dashboard/scripts/${script.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => toggleExpand(script.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded preview */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                        <div>
                          <h5 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            <Zap className="h-3 w-3" />
                            Hook
                          </h5>
                          <p className="rounded-lg bg-indigo-50 p-3 text-sm text-gray-700">
                            {script.hook}
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <FileText className="h-3 w-3" />
                            Body
                          </h5>
                          <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700 line-clamp-6">
                            {script.body}
                          </p>
                        </div>
                        <div>
                          <h5 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-green-600">
                            <MessageSquare className="h-3 w-3" />
                            CTA
                          </h5>
                          <p className="rounded-lg bg-green-50 p-3 text-sm text-gray-700">
                            {script.cta}
                          </p>
                        </div>

                        {script.revision_notes && (
                          <div className="rounded-lg bg-orange-50 p-3">
                            <p className="text-xs font-medium text-orange-700">
                              Revision Notes
                            </p>
                            <p className="mt-1 text-sm text-orange-600">
                              {script.revision_notes}
                            </p>
                          </div>
                        )}

                        {/* Inline actions */}
                        <div className="flex items-center gap-2 pt-2">
                          {onApprove && script.status !== 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-green-600 hover:bg-green-50"
                              onClick={() => onApprove(script.id)}
                              disabled={isLoading}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                          {onReject && script.status !== 'revision_needed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50"
                              onClick={() =>
                                onReject(script.id, 'Needs revision')
                              }
                              disabled={isLoading}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          )}
                          <Link href={`/dashboard/scripts/${script.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              <ExternalLink className="mr-1 h-3.5 w-3.5" />
                              Full View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Batch reject dialog */}
      {showBatchActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Reject {selectedIds.size} Scripts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a note explaining why these scripts need revision.
            </p>
            <textarea
              value={batchRejectNotes}
              onChange={(e) => setBatchRejectNotes(e.target.value)}
              className="mt-4 flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Revision notes..."
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBatchActions(false);
                  setBatchRejectNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onBatchReject?.(
                    Array.from(selectedIds),
                    batchRejectNotes
                  );
                  setShowBatchActions(false);
                  setBatchRejectNotes('');
                  setSelectedIds(new Set());
                }}
                disabled={!batchRejectNotes.trim()}
              >
                Reject All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
