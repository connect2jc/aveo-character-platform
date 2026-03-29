import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'indigo' | 'green' | 'yellow' | 'red';
  showLabel?: boolean;
}

function Progress({ value, max = 100, className, color = 'indigo', showLabel = false }: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-600">{value} / {max}</span>
          <span className="text-gray-500">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
