import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { StepId } from '@/types';
import { STEP_CONFIG } from '@/lib/constants';
import { useOnboardingStore, selectOverallProgress } from '@/store/onboarding.store';

export interface PageHeaderProps {
  stepId?: StepId;
  title: string;
  description: string;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  stepId,
  title,
  description,
  badge,
}) => {
  const overallProgress = useOnboardingStore(selectOverallProgress);
  const step = stepId ? STEP_CONFIG[stepId] : undefined;

  return (
    <div className="mb-6 space-y-3 text-left">
      {/* Breadcrumb & Step indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-400">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          {step && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {step.shortTitle}
              </span>
            </>
          )}
        </nav>

        {step && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-indigo-600 dark:text-indigo-400">
              Step {step.stepNumber} of 8
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-400">{step.estimatedMinutes} mins est.</span>
          </div>
        )}
      </div>

      {/* Thin Progress Bar for Wizard */}
      {step && (
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
    </div>
  );
};
