import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  UserCheck,
  UploadCloud,
  CreditCard,
  ShieldAlert,
  GraduationCap,
  Users,
  ListChecks,
  Lock,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  useOnboardingStore,
  selectOverallProgress,
  isStepLocked,
} from '@/store/onboarding.store';
import { STEP_ORDER, STEP_CONFIG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { StepId } from '@/types';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
}

const navIcons: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4 shrink-0" />,
  FileCheck: <FileCheck className="w-4 h-4 shrink-0" />,
  UserCheck: <UserCheck className="w-4 h-4 shrink-0" />,
  UploadCloud: <UploadCloud className="w-4 h-4 shrink-0" />,
  CreditCard: <CreditCard className="w-4 h-4 shrink-0" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 shrink-0" />,
  GraduationCap: <GraduationCap className="w-4 h-4 shrink-0" />,
  Users: <Users className="w-4 h-4 shrink-0" />,
  ListChecks: <ListChecks className="w-4 h-4 shrink-0" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onNavigateMobile,
}) => {
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const overallProgress = useOnboardingStore(selectOverallProgress);

  const handleSignOut = () => {
    toast.info('Sign Out Requested', 'Session is managed in demo mode.');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl h-full transition-all duration-300 select-none z-20',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <div>
        {/* Logo / Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <NavLink
            to="/"
            onClick={onNavigateMobile}
            className="flex items-center gap-2.5 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="text-left">
                <span className="font-heading text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Onboardly
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Candidate Portal
                </span>
              </div>
            )}
          </NavLink>

          {/* Collapse trigger button (desktop only) */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-17rem)]" aria-label="Portal Navigation">
          {/* Dashboard item */}
          <NavLink
            to="/"
            end
            onClick={onNavigateMobile}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200',
                isCollapsed && 'justify-center px-0',
              )
            }
          >
            {navIcons['LayoutDashboard']}
            {!isCollapsed && <span>Dashboard Overview</span>}
          </NavLink>

          {/* Step divider */}
          <div className="pt-2 pb-1">
            {!isCollapsed ? (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Onboarding Flow
              </span>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2" />
            )}
          </div>

          {/* 8 Step Links */}
          {STEP_ORDER.map((stepId: StepId) => {
            const step = STEP_CONFIG[stepId];
            const locked = isStepLocked(stepId, stepStatus);
            const status = stepStatus[stepId];
            const isCompleted = status === 'completed';

            const itemContent = (
              <NavLink
                key={step.id}
                to={locked ? '#' : step.path}
                onClick={(e) => {
                  if (locked) {
                    e.preventDefault();
                    toast.warning(
                      'Step Locked',
                      'Complete the preceding required steps to unlock this section.',
                    );
                  } else {
                    onNavigateMobile?.();
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                    isActive && !locked
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200',
                    locked && 'opacity-50 cursor-not-allowed hover:bg-transparent text-slate-400 dark:text-slate-600',
                    isCollapsed && 'justify-center px-0',
                  )
                }
                aria-disabled={locked}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                        : locked
                          ? 'text-slate-400 dark:text-slate-600'
                          : 'text-slate-500 group-hover:text-indigo-600',
                    )}
                  >
                    {locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      navIcons[step.iconName] || <FileCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">
                      {step.stepNumber}. {step.shortTitle}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="shrink-0 flex items-center">
                    {locked && <Lock className="w-3 h-3 text-slate-400" />}
                    {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                )}
              </NavLink>
            );

            if (locked && isCollapsed) {
              return (
                <Tooltip
                  key={step.id}
                  content={`Step ${step.stepNumber}: ${step.title} (Locked)`}
                  position="right"
                >
                  <div>{itemContent}</div>
                </Tooltip>
              );
            }

            return itemContent;
          })}
        </nav>
      </div>

      {/* Bottom Section: Live Progress Card + Sign Out Stub */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        {!isCollapsed ? (
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-slate-900/90 dark:to-indigo-950/40 p-3.5 shadow-sm text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Overall Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              {overallProgress === 100
                ? '🎉 Ready for submission!'
                : 'Complete all steps before Day 1'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content={`Overall Progress: ${overallProgress}%`} position="right">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {overallProgress}%
              </div>
            </Tooltip>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors',
            isCollapsed && 'justify-center px-0',
          )}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
