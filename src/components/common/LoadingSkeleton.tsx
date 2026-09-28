import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        'animate-pulse bg-slate-200/80 dark:bg-slate-800/80',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Main card skeleton */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 bg-white/50 dark:bg-slate-900/50">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-28 w-full mt-4" />
      </div>
    </div>
  );
};
