'use client';

import { Script } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';

interface ScriptReviewProps {
  script: Script;
  onApprove?: () => void;
  onRequestRevision?: (notes: string) => void;
  isLoading?: boolean;
}

export function ScriptReview({ script, onApprove, onRequestRevision, isLoading }: ScriptReviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{script.title}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span>v{script.version}</span>
              <span>~{formatDuration(script.duration_estimate)}</span>
            </div>
          </div>
          <Badge
            variant={
              script.status === 'approved'
                ? 'success'
                : script.status === 'revision_needed'
                ? 'warning'
                : 'secondary'
            }
          >
            {script.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-indigo-600">HOOK</h4>
          <p className="rounded-lg bg-indigo-50 p-4 text-sm text-gray-800">{script.hook}</p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-600">BODY</h4>
          <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
            {script.body}
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-green-600">CTA</h4>
          <p className="rounded-lg bg-green-50 p-4 text-sm text-gray-800">{script.cta}</p>
        </div>
        {script.revision_notes && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-orange-600">REVISION NOTES</h4>
            <p className="rounded-lg bg-orange-50 p-4 text-sm text-gray-800">
              {script.revision_notes}
            </p>
          </div>
        )}
      </CardContent>
      {(onApprove || onRequestRevision) && (
        <CardFooter>
          <div className="flex w-full justify-end gap-3">
            {onRequestRevision && (
              <Button
                variant="outline"
                onClick={() => onRequestRevision('Please revise.')}
                disabled={isLoading}
              >
                Request Revision
              </Button>
            )}
            {onApprove && (
              <Button onClick={onApprove} isLoading={isLoading}>
                Approve Script
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
