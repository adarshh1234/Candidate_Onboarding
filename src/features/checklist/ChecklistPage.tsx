import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Laptop,
  Users,
  Building,
  ShieldCheck,
  Send,
  PartyPopper,
  Check,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useHiringStore } from '@/store/hiring.store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { ChecklistItem } from '@/types';

export const ChecklistPage: React.FC = () => {
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const checklist = useOnboardingStore((state) => state.checklist);
  const toggleChecklistItem = useOnboardingStore((state) => state.toggleChecklistItem);
  const isSubmitted = useOnboardingStore((state) => state.isSubmitted);
  const submitOnboarding = useOnboardingStore((state) => state.submitOnboarding);
  const candidate = useOnboardingStore((state) => state.candidate);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalItems = checklist.length;
  const completedItems = checklist.filter((item) => item.isCompleted).length;
  const percentage = Math.round((completedItems / totalItems) * 100);
  const isAllChecklistDone = completedItems === totalItems;

  // Trigger celebration when reaching 100% checklist
  useEffect(() => {
    if (isAllChecklistDone) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isAllChecklistDone]);

  const handleToggle = (item: ChecklistItem) => {
    toggleChecklistItem(item.id);
  };

  const handleConfirmSubmit = () => {
    submitOnboarding();
    useHiringStore.getState().updateCandidate('CAND-001', {
      stage: 'Ready for Day 1',
      overallProgress: 100,
    });
    useHiringStore.getState().appendActivity({
      actor: 'Candidate (Aarav Sharma)',
      candidateId: 'CAND-001',
      candidateName: 'Aarav Sharma',
      action: 'Onboarding Submitted',
      details: 'All 8 steps completed and verified for Day-1 readiness.',
      type: 'system',
    });
    setIsConfirmOpen(false);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });
    toast.success(
      'Onboarding Submitted!',
      'Congratulations! You are officially prepared and compliant for Day 1.',
    );
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    IT: <Laptop className="w-3.5 h-3.5" />,
    Team: <Users className="w-3.5 h-3.5" />,
    HR: <ShieldCheck className="w-3.5 h-3.5" />,
    Workspace: <Building className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="checklist"
        title="Day-1 Readiness & Final Submission"
        description="Verify your first-day schedule, hardware deliveries, and complete the final submission of your onboarding dossier."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {completedItems} of {totalItems} Ready
            </span>
            <StatusBadge status={stepStatus.checklist} size="md" />
          </div>
        }
      />

      {/* Progress Card: Turns Vibrant Emerald Green at 100% */}
      <Card
        className={cn(
          'p-6 transition-all duration-300 text-left',
          isAllChecklistDone
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20'
            : 'bg-white dark:bg-slate-900',
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider',
                  isAllChecklistDone ? 'text-emerald-100' : 'text-indigo-600 dark:text-indigo-400',
                )}
              >
                Day-1 Preparedness Score
              </span>
              {isAllChecklistDone && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  100% Completed
                </span>
              )}
            </div>

            <h3
              className={cn(
                'font-heading text-2xl font-bold',
                isAllChecklistDone ? 'text-white' : 'text-slate-900 dark:text-slate-100',
              )}
            >
              {isAllChecklistDone ? '🎉 All Day-1 Tasks Completed!' : `${percentage}% Ready for Day 1`}
            </h3>

            <p
              className={cn(
                'text-xs max-w-md leading-relaxed',
                isAllChecklistDone ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {isAllChecklistDone
                ? 'Your workstation setup, credentials, and team introductions are in place.'
                : 'Click any task in the timeline to mark it complete as you verify your equipment and schedule.'}
            </p>
          </div>

          <div className="w-full sm:w-48 shrink-0 space-y-1.5">
            <Progress
              value={percentage}
              className={isAllChecklistDone ? 'bg-emerald-700/60' : undefined}
              indicatorClassName={isAllChecklistDone ? 'bg-white' : undefined}
            />
            <div
              className={cn(
                'flex justify-between text-xs font-semibold',
                isAllChecklistDone ? 'text-emerald-100' : 'text-slate-500',
              )}
            >
              <span>Verified Tasks</span>
              <span>
                {completedItems}/{totalItems}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Success Panel if Onboarding is Officially Submitted */}
      {isSubmitted && (
        <Card className="p-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 dark:from-slate-900 dark:to-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-4 h-4" />
                <span>Onboarding Officially Finalized!</span>
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
                Congratulations, {candidate.name}!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Your onboarding forms, verified credentials, and compliance agreements have been
                securely archived. The People Ops team and your manager, {candidate.manager.name}, look
                forward to welcoming you on your start date ({candidate.startDate}).
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Day-1 Timeline List */}
      <div className="space-y-3 text-left">
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Interactive Day-1 Schedule Timeline
        </h3>

        <div className="space-y-2">
          {checklist.map((item, index) => {
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(item);
                  }
                }}
                className={cn(
                  'group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none',
                  item.isCompleted
                    ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-soft',
                )}
              >
                {/* Checkbox circle indicator */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                    item.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-indigo-500',
                  )}
                >
                  <Check
                    className={cn(
                      'w-4 h-4 stroke-[3] transition-opacity',
                      item.isCompleted ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">0{index + 1}</span>
                    <h4
                      className={cn(
                        'text-sm font-semibold transition-all',
                        item.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100',
                      )}
                    >
                      {item.title}
                    </h4>

                    {/* Category Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {categoryIcons[item.category]}
                      {item.category}
                    </span>

                    {/* Virtual / On-Site Badge */}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        item.isVirtual
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                      )}
                    >
                      {item.isVirtual ? 'Virtual' : 'Physical Hardware'}
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      item.isCompleted
                        ? 'text-slate-400 dark:text-slate-500 line-through'
                        : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {item.description}
                  </p>

                  <div className="text-[11px] font-medium text-slate-400 pt-0.5">
                    Target Time: {item.dueDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Action Submission Bar */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto"
        >
          Previous Step
        </Button>

        <Button
          type="button"
          variant="gradient"
          size="lg"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isSubmitted}
          className="w-full sm:w-auto shadow-lg shadow-indigo-500/25 gap-2 font-bold"
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Onboarding Completed
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Onboarding Dossier
            </>
          )}
        </Button>
      </div>

      {/* Final Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Final Onboarding Submission"
        description="Verify and lock your profile for payroll generation and IT asset setup."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-xs text-slate-600 dark:text-slate-300 space-y-2 border border-indigo-100 dark:border-indigo-900/50">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Candidate Dossier Ready:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Candidate: {candidate.name} ({candidate.role})</li>
              <li>Offer Letter: Formally Accepted</li>
              <li>Personal Data & Emergency Contact: Verified</li>
              <li>Direct Deposit & PAN: Encrypted & Stored</li>
              <li>Compliance & Security Policies: 6 of 6 Acknowledged</li>
              <li>Day-1 Tasks: {completedItems} of {totalItems} confirmed</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Once submitted, your records will be routed to HR Operations for formal employee ID
            generation.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmSubmit}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Finalize
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
