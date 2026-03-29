'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UsageMeterProps {
  title: string;
  used: number;
  limit: number;
  unit?: string;
}

export function UsageMeter({ title, used, limit, unit = '' }: UsageMeterProps) {
  const percentage = Math.round((used / limit) * 100);
  const color = percentage >= 90 ? 'red' : percentage >= 70 ? 'yellow' : 'indigo';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{used}</span>
          <span className="text-sm text-gray-400">/ {limit} {unit}</span>
        </div>
        <Progress value={used} max={limit} color={color} className="mt-3" />
        {percentage >= 90 && (
          <p className="mt-2 text-xs text-red-600">
            You are approaching your plan limit. Consider upgrading.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
