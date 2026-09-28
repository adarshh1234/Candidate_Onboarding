import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorClassName?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 transition-all duration-500 ease-out rounded-full',
            indicatorClassName,
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    </div>
  );
};
