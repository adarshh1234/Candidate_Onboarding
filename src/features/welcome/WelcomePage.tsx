import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Eye,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  UserCheck,
  Award,
  Sparkles,
  Download,
  Clock,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useHiringStore } from '@/store/hiring.store';
import { OFFER_DETAILS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const candidate = useOnboardingStore((state) => state.candidate);
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const offerAccepted = useOnboardingStore((state) => state.offerAccepted);
  const acceptOffer = useOnboardingStore((state) => state.acceptOffer);

  const hiringCandidate = useHiringStore((state) => state.getCandidate('CAND-001'));
  const offerStatus = hiringCandidate?.offer?.status || 'Released';
  const isOfferReleased = offerStatus === 'Released' || offerStatus === 'Accepted';

  const [isChecked, setIsChecked] = useState(offerAccepted);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAcceptAndContinue = () => {
    if (!isChecked) return;
    acceptOffer();
    useHiringStore.getState().acceptOfferByCandidate('CAND-001');
    toast.success('Offer Accepted!', 'Welcome aboard! Proceeding to your personal profile.');
    navigate('/candidate/personal');
  };

  if (!isOfferReleased) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          stepId="welcome"
          title="Employment Offer & Terms"
          description="Please review your compensation structure, reporting relationship, and formally accept your employment contract."
          badge={<StatusBadge status={stepStatus.welcome} size="md" />}
        />

        <Card className="p-10 text-center space-y-4 max-w-lg mx-auto border-dashed">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
              Offer Pending Release
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your official employment offer letter is currently undergoing final compensation and executive review.
              Once released by your recruiting team, you will be able to review and formally accept it right here.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            Recruiter Owner: <strong className="text-slate-900 dark:text-white">{hiringCandidate?.recruiterOwner || 'Priya Nair'}</strong> (recruiter@apex.com)
          </div>
        </Card>

        <StepFooter
          backTo="/candidate"
          backText="Dashboard"
          canContinue={false}
          onContinue={() => {}}
          continueText="Offer Pending"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="welcome"
        title="Employment Offer & Terms"
        description="Please review your compensation structure, reporting relationship, and formally accept your employment contract."
        badge={<StatusBadge status={stepStatus.welcome} size="md" />}
      />

      {/* Offer Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <UserCheck className="w-4 h-4" />
            <span>Position & Role</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {candidate.role}
          </p>
          <p className="text-xs text-slate-400">{OFFER_DETAILS.band}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>Total Annual CTC</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {OFFER_DETAILS.annualCTC}
          </p>
          <p className="text-xs text-slate-400">Fixed + Variable Component</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>Equity Grant (ESOPs)</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {OFFER_DETAILS.equityGrant.split('(')[0]}
          </p>
          <p className="text-xs text-slate-400">4-year vesting schedule</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Joining Bonus</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {OFFER_DETAILS.joiningBonus.split('(')[0]}
          </p>
          <p className="text-xs text-slate-400">Payable in 1st payroll cycle</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Start Date</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {OFFER_DETAILS.joiningDate}
          </p>
          <p className="text-xs text-slate-400">Bengaluru Office & Remote</p>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Reporting Manager</span>
          </div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
            {candidate.manager.name}
          </p>
          <p className="text-xs text-slate-400">{candidate.manager.role}</p>
        </Card>
      </div>

      {/* Offer Letter Document Preview Row */}
      <Card className="p-6 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Official Employment Offer Letter (Signed PDF)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ApexTech_Offer_{candidate.name.replace(/\s+/g, '_')}_2026.pdf • 2.4 MB • Issued Oct 01, 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              View Document
            </Button>
          </div>
        </div>

        {/* Acceptance Box */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Checkbox
            id="offer-acceptance"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            label="I accept the employment offer and agree to the terms and policies of Apex Technologies."
            description="By checking this box, you confirm that you have reviewed the offer specifications, confidentiality clauses, and tentative joining schedule."
          />
        </div>
      </Card>

      {/* Step Footer */}
      <StepFooter
        backTo="/candidate"
        backText="Dashboard"
        canContinue={isChecked}
        onContinue={handleAcceptAndContinue}
        continueText={offerAccepted ? 'Proceed to Personal Info' : 'Accept & Continue'}
      />

      {/* PDF Document Preview Dialog */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Official Employment Offer Letter Preview"
        description="Ref: APEX/HR/2026/L5-7281"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-left">
          {/* Mock PDF Document Layout */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6 space-y-4 max-h-[60vh] overflow-y-auto font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  APEX TECHNOLOGIES PVT. LTD.
                </h4>
                <p className="text-[11px] text-slate-400">Embassy TechVillage, Bellandur, Bengaluru</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Digitally Signed
              </span>
            </div>

            <div className="space-y-1">
              <p><strong>Date:</strong> October 01, 2026</p>
              <p><strong>To:</strong> {candidate.name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Dear {candidate.name.split(' ')[0]},
              </p>
              <p>
                We are delighted to offer you the full-time role of{' '}
                <strong>{candidate.role}</strong> with Apex Technologies. This letter formalizes the
                terms and conditions of your engagement.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-slate-100">1. Compensation & Incentives</h5>
              <p>
                Your Cost to Company (CTC) will be <strong>{OFFER_DETAILS.annualCTC}</strong> per annum.
                In addition, you are entitled to a one-time signing bonus of{' '}
                <strong>{OFFER_DETAILS.joiningBonus}</strong> and an equity grant of{' '}
                <strong>{OFFER_DETAILS.equityGrant}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-slate-100">2. Commencement Date & Location</h5>
              <p>
                Your appointment will take effect on <strong>{OFFER_DETAILS.joiningDate}</strong>.
                You will report to <strong>{OFFER_DETAILS.reportingManager}</strong> in Bengaluru, India.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-slate-100">3. Confidentiality & IP Rights</h5>
              <p>
                You agree not to disclose proprietary algorithms, commercial secrets, or candidate/customer
                data during or subsequent to your employment tenure.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Page 1 of 3</span>
              <span className="text-[11px] text-slate-400">Authorized Signatory: Sarah Jenkins</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Download Initialized', 'Mock offer letter downloaded.');
              }}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Copy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setIsChecked(true);
                setIsPreviewOpen(false);
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Confirm & Agree
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
