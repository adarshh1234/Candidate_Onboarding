import React from 'react';
import { cn } from '@/lib/utils';

export interface TraitScoreItem {
  key: string;
  label: string;
  score: number; // 0 to 100
  desc?: string;
}

interface ScoreBarsProps {
  items: TraitScoreItem[];
  className?: string;
  size?: 'sm' | 'md';
}

export const ScoreBars: React.FC<ScoreBarsProps> = ({
  items,
  className,
  size = 'md',
}) => {
  return (
    <div className={cn('space-y-3.5', className)}>
      {items.map((item) => {
        const score = Math.max(0, Math.min(100, item.score));

        // Dynamic color styling according to score band
        let barColor = 'from-teal-500 to-emerald-500';
        let textColor = 'text-teal-600 dark:text-teal-400';

        if (score >= 80) {
          barColor = 'from-emerald-500 to-teal-500';
          textColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (score >= 60) {
          barColor = 'from-teal-500 to-cyan-500';
          textColor = 'text-teal-600 dark:text-teal-400';
        } else if (score >= 40) {
          barColor = 'from-amber-500 to-yellow-500';
          textColor = 'text-amber-600 dark:text-amber-400';
        } else {
          barColor = 'from-rose-500 to-red-500';
          textColor = 'text-rose-600 dark:text-rose-400';
        }

        return (
          <div key={item.key} className="space-y-1 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.label}
              </span>
              <span className={cn('font-mono font-bold', textColor)}>
                {score}%
              </span>
            </div>

            {item.desc && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {item.desc}
              </p>
            )}

            <div
              className={cn(
                'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden',
                size === 'sm' ? 'h-1.5' : 'h-2',
              )}
            >
              <div
                className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', barColor)}
                style={{ width: `${score}%` }}
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={item.label}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
