'use client';

import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  title: string;
  used: number;
  limit: number;
  unit?: string;
  planName?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export function UsageMeter({
  title,
  used,
  limit,
  unit = '',
  planName,
  showUpgrade = true,
  onUpgrade,
}: UsageMeterProps) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);

  const getColor = () => {
    if (percentage > 80) return { bar: 'bg-red-500', text: 'text-red-600', ring: 'stroke-red-500', bg: 'bg-red-50' };
    if (percentage > 60) return { bar: 'bg-yellow-500', text: 'text-yellow-600', ring: 'stroke-yellow-500', bg: 'bg-yellow-50' };
    return { bar: 'bg-indigo-500', text: 'text-indigo-600', ring: 'stroke-indigo-500', bg: 'bg-indigo-50' };
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {planName && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {planName}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{used}</span>
              <span className="text-sm text-gray-400">/ {limit} {unit}</span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="mt-3">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn('h-full rounded-full transition-all duration-700 ease-out', color.bar)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between">
                <span className={cn('text-xs font-medium', color.text)}>{percentage}% used</span>
                <span className="text-xs text-gray-400">{limit - used} remaining</span>
              </div>
            </div>

            {/* Warning / Upgrade */}
            {percentage > 80 && showUpgrade && (
              <div className={cn('mt-3 rounded-lg p-2.5', color.bg)}>
                <p className={cn('text-xs font-medium', color.text)}>
                  {percentage >= 100
                    ? 'You have reached your plan limit. Upgrade to continue.'
                    : 'Approaching your plan limit. Consider upgrading.'}
                </p>
                {onUpgrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpgrade}
                    className="mt-2"
                  >
                    <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Circular Progress Indicator */}
          <div className="ml-4 flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 100 100" className="-rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className={color.ring}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
              />
            </svg>
            <div className="mt-[-62px] flex h-[80px] items-center justify-center">
              <span className={cn('text-lg font-bold', color.text)}>{percentage}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
