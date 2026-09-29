import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  id?: string;
  label: string;
  value: string | number;
  subtext?: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal' | 'neutral';
}

interface StatCardRowProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const StatCardRow: React.FC<StatCardRowProps> = ({
  stats,
  columns = 4,
  className,
}) => {
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  }[columns];

  return (
    <div className={cn('grid gap-4', gridColsClass, className)}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const variant = stat.variant || 'default';

        const colorMap = {
          default: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50',
          teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-100 dark:border-teal-900/50',
          success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50',
          warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50',
          danger: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50',
          neutral: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
        }[variant];

        return (
          <Card key={stat.id || idx} className="p-4 sm:p-5 flex items-start justify-between gap-3 text-left">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {stat.label}
              </p>
              <p className="font-heading text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {stat.value}
              </p>
              {(stat.subtitle || stat.subtext) && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {stat.subtitle || stat.subtext}
                </p>
              )}
            </div>

            {Icon && (
              <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs', colorMap)}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
