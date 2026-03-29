'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-indigo-600 bg-indigo-100',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
      className
    )}>
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 transition-all duration-300 group-hover:from-indigo-50/50 group-hover:to-purple-50/30" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
            {change && (
              <div className="mt-2 flex items-center gap-1.5">
                {changeType === 'positive' && (
                  <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <p
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-green-600',
                    changeType === 'negative' && 'text-red-600',
                    changeType === 'neutral' && 'text-gray-500'
                  )}
                >
                  {change}
                </p>
              </div>
            )}
          </div>
          <div className={cn(
            'rounded-xl p-3 transition-transform duration-300 group-hover:scale-110',
            iconColor
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
