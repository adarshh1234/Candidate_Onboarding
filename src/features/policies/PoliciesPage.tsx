import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CheckCheck,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { mockPolicies } from '@/mocks/policies';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Policy } from '@/types';

export const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const readPolicyIds = useOnboardingStore((state) => state.readPolicyIds);
  const acknowledgedPolicyIds = useOnboardingStore((state) => state.acknowledgedPolicyIds);
  const markPolicyAsRead = useOnboardingStore((state) => state.markPolicyAsRead);
  const acknowledgePolicy = useOnboardingStore((state) => state.acknowledgePolicy);
  const acknowledgeAllPolicies = useOnboardingStore((state) => state.acknowledgeAllPolicies);
  const setStepStatus = useOnboardingStore((state) => state.setStepStatus);

  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalPolicies = mockPolicies.length;
  const acknowledgedCount = acknowledgedPolicyIds.length;
  const allRead = mockPolicies.every((p) => readPolicyIds.includes(p.id));
  const allAcknowledged = acknowledgedCount === totalPolicies;

  const handleOpenPolicy = (policy: Policy) => {
    setActivePolicy(policy);
    setHasScrolledToEnd(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Scrolled close to bottom (within 20px)
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setHasScrolledToEnd(true);
    }
  };

  const handleConfirmRead = () => {
    if (activePolicy) {
      markPolicyAsRead(activePolicy.id);
      setActivePolicy(null);
      toast.info('Policy Read', `You have finished reviewing: ${activePolicy.title}`);
    }
  };

  const handleAcknowledgeToggle = (policyId: string) => {
    if (!readPolicyIds.includes(policyId)) {
      toast.warning('Reading Required', 'Please open and read the policy first before acknowledging.');
      return;
    }
    acknowledgePolicy(policyId);
  };

  const handleAcknowledgeAll = () => {
    if (!allRead) {
      toast.warning(
        'Action Restricted',
        'You must read all 6 policy documents before using "Acknowledge All".',
      );
      return;
    }
    acknowledgeAllPolicies();
    toast.success('All Policies Acknowledged', 'All compliance guidelines accepted.');
  };

  const handleContinue = () => {
    if (!allAcknowledged) {
      toast.error('Policies Incomplete', 'Please acknowledge all company policies to proceed.');
      return;
    }
    setStepStatus('policies', 'completed');
    toast.success('Compliance Step Complete', 'Proceeding to Onboarding Modules.');
    navigate('/candidate/training');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="policies"
        title="Company Policies & Governance"
        description="Review and digitally acknowledge organizational compliance, data protection standards, and codes of conduct."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {acknowledgedCount} of {totalPolicies} Acknowledged
            </span>
            <StatusBadge status={stepStatus.policies} size="md" />
          </div>
        }
      />

      {/* Control bar: Progress + Acknowledge All convenience button */}
      <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
              Mandatory Compliance Acknowledgment
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {allAcknowledged
                ? 'All 6 policies have been acknowledged.'
                : 'Click "Read Policy" to review terms. Checkbox unlocks after reading.'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!allRead || allAcknowledged}
          onClick={handleAcknowledgeAll}
          className="text-xs shrink-0 gap-1.5"
          title={!allRead ? 'Read all policies first to enable this button' : 'Acknowledge all policies'}
        >
          <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Acknowledge All ({acknowledgedCount}/{totalPolicies})
        </Button>
      </Card>

      {/* List of 6 Policies */}
      <div className="space-y-3">
        {mockPolicies.map((policy, index) => {
          const isRead = readPolicyIds.includes(policy.id);
          const isAcked = acknowledgedPolicyIds.includes(policy.id);

          return (
            <Card
              key={policy.id}
              className={`p-5 transition-all text-left ${
                isAcked
                  ? 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/15 dark:bg-emerald-950/10'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      0{index + 1}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                      {policy.title}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {policy.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {policy.readingTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {policy.summary}
                  </p>
                </div>

                {/* Actions: Read button + Acknowledge Checkbox */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant={isRead ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleOpenPolicy(policy)}
                    className="gap-1.5 text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {isRead ? 'Review Again' : 'Read Policy'}
                  </Button>

                  <div className="flex items-center">
                    <Checkbox
                      id={`ack-${policy.id}`}
                      checked={isAcked}
                      disabled={!isRead}
                      onChange={() => handleAcknowledgeToggle(policy.id)}
                      label={<span className="text-xs font-semibold">Acknowledge</span>}
                      title={
                        !isRead ? 'Read policy to enable acknowledgment' : 'Confirm you accept terms'
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress alert */}
      {!allAcknowledged && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {totalPolicies - acknowledgedCount} more policies require acknowledgment before you can proceed.
          </span>
        </div>
      )}

      {/* Step Footer */}
      <StepFooter
        backTo="/candidate/bank"
        canContinue={allAcknowledged}
        onContinue={handleContinue}
        continueText="Continue to Training Modules"
      />

      {/* Policy Reader Dialog */}
      {activePolicy && (
        <Dialog
          isOpen={!!activePolicy}
          onClose={() => setActivePolicy(null)}
          title={activePolicy.title}
          description={`Category: ${activePolicy.category} • ${activePolicy.version} • Effective: ${activePolicy.effectiveDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-left">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3 max-h-[50vh] overflow-y-auto text-xs leading-relaxed text-slate-700 dark:text-slate-300"
            >
              <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-900/50 mb-3">
                📌 Please scroll to the bottom of this document to confirm you have reviewed its terms.
              </div>

              {activePolicy.content.map((paragraph, i) => (
                <p key={i} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>End of Policy Document</span>
                <span>Apex Global Compliance Board</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {hasScrolledToEnd ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scrolled to end
                  </span>
                ) : (
                  'Scroll to the end to confirm'
                )}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePolicy(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!hasScrolledToEnd}
                  onClick={handleConfirmRead}
                  className="gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I have finished reading
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
