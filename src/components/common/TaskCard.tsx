import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  UserCheck,
  UploadCloud,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Users,
  ListChecks,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

export interface TaskCardProps {
  task: Task;
  isLocked: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  FileCheck: <FileCheck className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />,
  UploadCloud: <UploadCloud className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  ListChecks: <ListChecks className="w-5 h-5" />,
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, isLocked }) => {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  return (
    <Card
      className={cn(
        'group flex flex-col justify-between p-5 transition-all duration-200',
        isLocked
          ? 'opacity-65 bg-slate-50/50 dark:bg-slate-900/40 border-dashed cursor-not-allowed'
          : 'hover:-translate-y-1 hover:shadow-glass-hover hover:border-indigo-200 dark:hover:border-indigo-800/80',
        isCompleted && 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10',
      )}
    >
      <div>
        {/* Top row: Icon + Step number + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                isCompleted
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : isInProgress
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                    : isLocked
                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600',
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                iconMap[task.iconName] || <FileCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Step 0{task.stepNumber}
              </span>
              <h4 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {task.title}
              </h4>
            </div>
          </div>
          <StatusBadge status={task.status} size="sm" />
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Bottom row: Time + CTA button */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          ~{task.estimatedMinutes} mins
        </span>

        {isLocked ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Lock className="w-3 h-3" /> Locked
          </span>
        ) : (
          <Link
            to={task.path}
            className={cn(
              'inline-flex items-center gap-1 font-semibold transition-colors focus-visible:outline-none focus-visible:underline',
              isCompleted
                ? 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
            )}
          >
            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </Card>
  );
};
