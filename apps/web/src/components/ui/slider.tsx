'use client';

import { cn } from '@/lib/utils';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showValue?: boolean;
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  showValue = true,
}: SliderProps) {
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
          {showValue && <span className="text-sm text-gray-500">{value}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600 dark:bg-gray-700 dark:accent-purple-600"
      />
    </div>
  );
}

export { Slider };
