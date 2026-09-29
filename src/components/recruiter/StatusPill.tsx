import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export type StatusType =
  // Stage
  | 'Selected'
  | 'Offer Pending'
  | 'Offer Released'
  | 'Offer Accepted'
  | 'BGV In Progress'
  | 'Onboarding'
  | 'Ready for Day 1'
  | 'Offer Declined'
  // Offer Status
  | 'Draft'
  | 'Pending Approval'
  | 'Released'
  | 'Accepted'
  | 'Declined'
  | 'Expired'
  // BGV Status
  | 'Not Initiated'
  | 'In Progress'
  | 'Clear'
  | 'Discrepancy'
  | 'Failed'
  // Doc Status
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'missing'
  // Provision Status
  | 'Requested'
  | 'Ready'
  | 'Delivered'
  // Assessment
  | 'Assigned'
  | 'Submitted'
  | 'Evaluated'
  | 'Pass'
  | 'Fail'
  | 'Review'
  // Visa
  | 'Documents Collection'
  | 'Filed'
  | 'Under Review'
  | 'Approved'
  | 'Visa Stamped'
  | 'Travel Ready'
  | 'RFE'
  | 'Rejected'
  // Insurance
  | 'Not Started'
  | 'Invited'
  | 'Active'
  | 'Waived';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'sm',
  className,
  showIcon = true,
}) => {
  const normalized = status.toLowerCase().replace(/_/g, ' ');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let IconNode: React.ReactNode = <Clock className="w-3 h-3" />;

  if (
    normalized.includes('ready') ||
    normalized.includes('clear') ||
    normalized.includes('verified') ||
    normalized.includes('accepted') ||
    normalized.includes('approved') ||
    normalized.includes('active') ||
    normalized === 'pass' ||
    normalized === 'evaluated' ||
    normalized === 'recommended' ||
    normalized === 'exceeds' ||
    normalized.includes('delivered')
  ) {
    colorClasses =
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    IconNode = <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
  } else if (normalized === 'submitted' || normalized.includes('released')) {
    colorClasses =
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
    IconNode = <Send className="w-3 h-3 text-teal-500" />;
  } else if (normalized === 'assigned') {
    colorClasses =
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    IconNode = <Clock className="w-3 h-3 text-sky-500" />;
  } else if (
    normalized.includes('in progress') ||
    normalized.includes('pending') ||
    normalized.includes('under review') ||
    normalized.includes('filed') ||
    normalized.includes('invited')
  ) {
    colorClasses =
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    IconNode = <Clock className="w-3 h-3 text-amber-500" />;
  } else if (
    normalized.includes('discrepancy') ||
    normalized.includes('rfe') ||
    normalized === 'review' ||
    normalized.includes('reservations') ||
    normalized === 'meets'
  ) {
    colorClasses =
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    IconNode = <AlertTriangle className="w-3 h-3 text-amber-500" />;
  } else if (
    normalized === 'fail' ||
    normalized.includes('failed') ||
    normalized.includes('rejected') ||
    normalized.includes('declined') ||
    normalized === 'expired' ||
    normalized.includes('not recommended') ||
    normalized === 'below'
  ) {
    colorClasses =
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900';
    IconNode = <XCircle className="w-3 h-3 text-rose-500" />;
  } else if (normalized.includes('onboarding')) {
    colorClasses =
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    IconNode = <ShieldCheck className="w-3 h-3 text-indigo-500" />;
  } else if (normalized.includes('draft') || normalized.includes('not started') || normalized.includes('not initiated')) {
    colorClasses =
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    IconNode = <FileText className="w-3 h-3 text-slate-400" />;
  }

  const formattedLabel = status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full border tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        colorClasses,
        className,
      )}
    >
      {showIcon && IconNode}
      <span>{formattedLabel}</span>
    </span>
  );
};
