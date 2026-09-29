import React from 'react';
import { ActivityLogItem } from '@/types';
import {
  FileCheck,
  Send,
  ShieldCheck,
  Users,
  GraduationCap,
  Laptop,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineListProps {
  items: ActivityLogItem[];
  emptyMessage?: string;
  className?: string;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  items,
  emptyMessage = 'No activity recorded yet.',
  className,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const getIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'offer':
        return <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'doc':
        return <FileCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'bgv':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'team':
        return <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      case 'training':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'provision':
        return <Laptop className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 text-left', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Timeline node */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs">
            {getIcon(item.type)}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {item.action}
              </h5>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                {new Date(item.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.details}
            </p>

            <p className="text-[10px] text-slate-400 pt-0.5">
              By <strong className="font-semibold text-slate-600 dark:text-slate-300">{item.actor}</strong>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
