import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building,
  User,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { isStepLocked } from '@/store/onboarding.store';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { mockInitialTasks } from '@/mocks/tasks';
import { mockUpcomingEvents } from '@/mocks/events';
import { ProgressRing } from '@/components/common/ProgressRing';
import { StatCard } from '@/components/common/StatCard';
import { TaskCard } from '@/components/common/TaskCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Task } from '@/types';

export const DashboardPage: React.FC = () => {
  const {
    candidate,
    stepStatus,
    overallProgress,
    completedCount,
    inProgressCount,
    pendingCount,
    daysLeft,
    isSubmitted,
  } = useOnboardingProgress();

  // Combine mockInitialTasks with current store status
  const currentTasks: Task[] = mockInitialTasks.map((task) => ({
    ...task,
    status: stepStatus[task.stepId],
  }));

  // Determine next actionable task
  const nextTask = currentTasks.find((t) => t.status !== 'completed' && !isStepLocked(t.stepId, stepStatus));

  return (
    <div className="space-y-6">
      {/* 1. Gradient Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl">
        {/* Decorative background blurs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome to {candidate.company}!</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {candidate.name}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
              We are ecstatic to have you join our {candidate.team} as a{' '}
              <span className="font-bold text-white">{candidate.role}</span>. Complete your onboarding
              tasks before your first day on{' '}
              <span className="underline decoration-indigo-300 font-semibold text-white">
                {formatDate(candidate.startDate)}
              </span>.
            </p>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-indigo-100">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <Building className="w-3.5 h-3.5 text-indigo-200" />
                {candidate.department}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <User className="w-3.5 h-3.5 text-indigo-200" />
                Manager: {candidate.manager.name}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-indigo-200" />
                Start: {formatDate(candidate.startDate)}
              </span>
            </div>
          </div>

          {/* Quick CTA or completion status */}
          <div className="flex flex-col items-center sm:items-end w-full md:w-auto shrink-0">
            {isSubmitted ? (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-4 py-2 rounded-2xl backdrop-blur-md text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Onboarding Submitted!
              </div>
            ) : nextTask ? (
              <Link to={nextTask.path}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg"
                >
                  Continue: {nextTask.title}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/checklist">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg"
                >
                  Review Day-1 Checklist
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid & Progress Ring Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Steps"
          value={`${completedCount} / 8`}
          subtitle={`${Math.round((completedCount / 8) * 100)}% of total requirements`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Active steps being completed"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <StatCard
          title="Pending Steps"
          value={pendingCount}
          subtitle="Remaining onboarding steps"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Days Left"
          value={`${daysLeft} Days`}
          subtitle={`Target joining: ${formatDate(candidate.startDate)}`}
          icon={<Calendar className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
        />
      </div>

      {/* 3. Main Dashboard Layout: Task Grid (Left 2 cols) + Progress & Events (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Task Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
                Your Onboarding Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow each step in sequence to complete your mandatory onboarding procedures.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {completedCount} of 8 Done
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isLocked={isStepLocked(task.stepId, stepStatus)}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Column: Animated Progress Ring Card & Upcoming Events */}
        <div className="space-y-6">
          {/* Progress Ring Card */}
          <Card className="p-6 text-center space-y-4">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
              Overall Completion
            </h3>
            <div className="flex justify-center py-2">
              <ProgressRing progress={overallProgress} size={150} strokeWidth={12} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
              {overallProgress === 100
                ? 'All mandatory requirements are satisfied! You are ready for your Day 1 induction.'
                : 'All fields and uploaded files are autosaved. You can leave and resume anytime.'}
            </p>
          </Card>

          {/* Upcoming Events List */}
          <Card className="p-5 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Day-1 Schedule & Events
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {mockUpcomingEvents.length} events
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {mockUpcomingEvents.map((evt) => (
                <div key={evt.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {evt.title}
                    </h4>
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                      {evt.time.split('-')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{evt.organizer}</span>
                    <span>•</span>
                    <span className="truncate">{evt.locationOrUrl.split(':')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/team">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  View Team Members & Calendar
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
