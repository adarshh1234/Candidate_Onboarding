import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface RecruiterPageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
}

export const RecruiterPageHeader: React.FC<RecruiterPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  action,
  actions,
}) => {
  const rightSlot = action || actions;
  return (
    <div className="mb-6 space-y-3 text-left">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          to="/recruiter/final-list"
          className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Recruiter Console</span>
        </Link>
        {breadcrumb && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {breadcrumb}
            </span>
          </>
        )}
      </nav>

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
};
