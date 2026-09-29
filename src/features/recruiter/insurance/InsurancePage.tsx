import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Ban,
  Users2,
  Eye,
  HeartPulse,
  UserCheck,
  ShieldAlert,
  Users,
  Building2,
  CreditCard,
  Heart,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, InsurancePlan } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import {
  INSURANCE_TABS,
  DEFAULT_INSURANCE_TAB_ID,
  VALID_INSURANCE_TAB_IDS,
  InsuranceTabId,
  InsuranceTabConfig,
} from './insurance.constants';
import { InsuranceTabs } from './components/InsuranceTabs';

// Helper for consistent insurance details & tiers
const getCandidateInsuranceDetails = (candidate: RecruiterCandidate) => {
  const ins = candidate.insurance;
  const hash = candidate.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const plan: InsurancePlan = ins?.plan || 'Plus';

  // Medical sums
  const gmcSum = plan === 'Premium' ? 1500000 : plan === 'Plus' ? 1000000 : 500000;
  const tpa = hash % 2 === 0 ? 'Medi Assist TPA' : 'Raksha Health TPA';

  // Life & Employee cover
  const lifeCover = plan === 'Premium' ? 7500000 : plan === 'Plus' ? 5000000 : 3000000;
  const nominee = ins?.nominee || `${candidate.name.split(' ')[0]}'s Family Trust / Spouse`;

  // Accident cover
  const gpaSum = plan === 'Premium' ? 5000000 : 2500000;

  // Master policy
  const masterPolicyNo = `POL-GMC-2026-${2000 + (hash % 7999)}`;
  const provider = ins?.provider || (hash % 2 === 0 ? 'Star Health & Allied' : 'HDFC ERGO General');

  return {
    plan,
    gmcSum,
    tpa,
    lifeCover,
    nominee,
    gpaSum,
    masterPolicyNo,
    provider,
    dependentsCount: ins?.dependents?.length || 0,
    dependents: ins?.dependents || [],
    effectiveDate: ins?.effectiveDate || 'Upon Day 1 (Offer Acceptance)',
    ecardIssued: ins?.ecardIssued ?? (ins?.enrolmentStatus === 'Active'),
  };
};

export const InsurancePage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as InsuranceTabId | null;
  const activeTab: InsuranceTabId =
    rawTab && VALID_INSURANCE_TAB_IDS.includes(rawTab) ? rawTab : DEFAULT_INSURANCE_TAB_ID;

  const handleTabChange = (tabId: InsuranceTabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === DEFAULT_INSURANCE_TAB_ID) {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    });
  };

  const currentTabConfig: InsuranceTabConfig = useMemo(
    () => INSURANCE_TABS.find((t) => t.id === activeTab) ?? INSURANCE_TABS[0]!,
    [activeTab]
  );

  const candidates = useHiringStore((state) => state.candidates);
  const sendInsuranceInvite = useHiringStore((state) => state.sendInsuranceInvite);
  const bulkSendInsuranceInvite = useHiringStore((state) => state.bulkSendInsuranceInvite);
  const approveInsuranceEnrolment = useHiringStore((state) => state.approveInsuranceEnrolment);
  const waiveInsurance = useHiringStore((state) => state.waiveInsurance);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Selected candidate for Policy Detail / E-Card Sheet
  const [activeCandidate, setActiveCandidate] = useState<RecruiterCandidate | null>(null);

  // Sync active candidate from store
  const currentCandidate = useMemo(() => {
    if (!activeCandidate) return null;
    return candidates.find((c) => c.id === activeCandidate.id) || null;
  }, [candidates, activeCandidate]);

  // Tab counts for badge counters in Tab pill headers
  const tabCounts = useMemo<Record<string, number>>(() => {
    const total = candidates.length;
    const active = candidates.filter((c) => c.insurance?.enrolmentStatus === 'Active').length;
    const submitted = candidates.filter((c) => c.insurance?.enrolmentStatus === 'Submitted').length;
    const withDependents = candidates.filter(
      (c) => (c.insurance?.dependents?.length || 0) > 0
    ).length;

    return {
      details: total,
      medical: total,
      employee: active,
      accident: total,
      family: withDependents,
      group: submitted,
    };
  }, [candidates]);

  // Tab-specific dynamic KPI cards
  const stats = useMemo<StatItem[]>(() => {
    const total = candidates.length;
    const active = candidates.filter((c) => c.insurance?.enrolmentStatus === 'Active').length;
    const submitted = candidates.filter((c) => c.insurance?.enrolmentStatus === 'Submitted').length;
    const pendingInvite = candidates.filter(
      (c) =>
        !c.insurance ||
        c.insurance.enrolmentStatus === 'Not Started' ||
        c.insurance.enrolmentStatus === 'Invited'
    ).length;

    switch (activeTab) {
      case 'medical': {
        const premiumTier = candidates.filter((c) => c.insurance?.plan === 'Premium').length;
        const plusTier = candidates.filter((c) => c.insurance?.plan === 'Plus').length;
        return [
          {
            id: 'gmc-enrolled',
            label: 'Total Medical Lives',
            value: total,
            subtitle: 'Group Medical Cover (GMC)',
            icon: HeartPulse,
            variant: 'teal',
          },
          {
            id: 'gmc-premium',
            label: 'Premium Tier (₹15L)',
            value: premiumTier,
            subtitle: 'Executive hospitalization coverage',
            icon: Sparkles,
            variant: 'success',
          },
          {
            id: 'gmc-plus',
            label: 'Plus Tier (₹10L)',
            value: plusTier,
            subtitle: 'Standard employee floater',
            icon: Heart,
          },
          {
            id: 'gmc-cashless',
            label: 'Cashless Network Rate',
            value: '10,500+ Hospitals',
            subtitle: 'Pan-India direct settlement',
            icon: Building2,
          },
        ];
      }

      case 'employee': {
        const ecards = candidates.filter((c) => c.insurance?.ecardIssued).length;
        return [
          {
            id: 'gtl-covered',
            label: 'Life Assured Staff',
            value: total,
            subtitle: 'Group Term Life (GTL) Plan',
            icon: UserCheck,
            variant: 'teal',
          },
          {
            id: 'ecards-active',
            label: 'Active Digital e-Cards',
            value: ecards,
            subtitle: 'Issued via employee portal',
            icon: CreditCard,
            variant: 'success',
          },
          {
            id: 'nominees-set',
            label: 'Nominees Recorded',
            value: total,
            subtitle: 'Beneficiary designations verified',
            icon: FileCheck,
          },
          {
            id: 'avg-life-cover',
            label: 'Standard Life Cover',
            value: '3x CTC (₹50L)',
            subtitle: 'Comprehensive death & disability',
            icon: ShieldCheck,
          },
        ];
      }

      case 'accident': {
        return [
          {
            id: 'gpa-covered',
            label: 'Accident Protection (GPA)',
            value: total,
            subtitle: '24/7 Global accident insurance',
            icon: ShieldAlert,
            variant: 'teal',
          },
          {
            id: 'gpa-sum',
            label: 'Capital Sum Insured',
            value: '₹25L – ₹50L',
            subtitle: 'Permanent & total disability',
            icon: ShieldCheck,
            variant: 'success',
          },
          {
            id: 'trauma-rider',
            label: 'Emergency Trauma Rider',
            value: '100% Incurred',
            subtitle: 'Direct hospital reimbursement',
            icon: HeartPulse,
          },
          {
            id: 'ambulance-cover',
            label: 'Ambulance Cover',
            value: 'Included',
            subtitle: 'Emergency transit allowance',
            icon: Clock,
          },
        ];
      }

      case 'family': {
        let totalDeps = 0;
        let spouseCount = 0;
        let childCount = 0;
        let parentCount = 0;

        candidates.forEach((c) => {
          (c.insurance?.dependents || []).forEach((d) => {
            totalDeps++;
            if (d.relation === 'Spouse') spouseCount++;
            else if (d.relation === 'Child') childCount++;
            else if (d.relation === 'Parent') parentCount++;
          });
        });

        return [
          {
            id: 'total-dependents',
            label: 'Total Dependents Covered',
            value: totalDeps,
            subtitle: 'Floater pool lives',
            icon: Users,
            variant: 'teal',
          },
          {
            id: 'spouses',
            label: 'Spouses Added',
            value: spouseCount,
            subtitle: 'Partner health benefits',
            icon: Users2,
            variant: 'success',
          },
          {
            id: 'children',
            label: 'Children Covered',
            value: childCount,
            subtitle: 'Up to 25 years of age',
            icon: Heart,
          },
          {
            id: 'parents',
            label: 'Dependent Parents',
            value: parentCount,
            subtitle: 'Senior citizen floater rider',
            icon: ShieldCheck,
          },
        ];
      }

      case 'group': {
        return [
          {
            id: 'master-policies',
            label: 'Active Master Policies',
            value: '3 Corporate Plans',
            subtitle: 'GMC, GTL & GPA Underwritten',
            icon: Building2,
            variant: 'teal',
          },
          {
            id: 'employer-split',
            label: 'Employer Contribution',
            value: '100% Subsidized',
            subtitle: 'Zero employee deduction for base',
            icon: CreditCard,
            variant: 'success',
          },
          {
            id: 'insurer-sla',
            label: 'Claim Settlement SLA',
            value: '<2 Hours Cashless',
            subtitle: 'Pre-auth turnaround time',
            icon: Clock,
          },
          {
            id: 'compliance-rate',
            label: 'Corporate Compliance',
            value: '100%',
            subtitle: 'IRDAI verified benefit plans',
            icon: CheckCircle2,
          },
        ];
      }

      case 'details':
      default: {
        return [
          {
            id: 'total-insurance',
            label: 'Eligible Employees',
            value: total,
            subtitle: 'Group Medical (GMC) + Term Life',
            icon: ShieldCheck,
          },
          {
            id: 'active-coverage',
            label: 'Active Policy Cards',
            value: active,
            subtitle: `${total > 0 ? Math.round((active / total) * 100) : 0}% covered`,
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'submitted',
            label: 'Submitted for Approval',
            value: submitted,
            subtitle: 'Dependents declared',
            icon: Users2,
            variant: 'teal',
          },
          {
            id: 'pending-invite',
            label: 'Awaiting Enrolment',
            value: pendingInvite,
            subtitle: 'Invite pending or sent',
            icon: Clock,
            variant: 'neutral',
          },
        ];
      }
    }
  }, [activeTab, candidates]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const ins = cand.insurance;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = cand.name.toLowerCase().includes(q);
        const matchProvider = (ins?.provider || '').toLowerCase().includes(q);
        const matchPlan = (ins?.plan || '').toLowerCase().includes(q);
        const matchDep = (ins?.dependents || []).some((d) => d.name.toLowerCase().includes(q));
        if (!matchName && !matchProvider && !matchPlan && !matchDep) return false;
      }
      if (filters.status && ins?.enrolmentStatus !== filters.status) return false;
      if (filters.department && cand.department !== filters.department) return false;
      return true;
    });
  }, [candidates, filters]);

  // Tab 1: Insurance Details Columns (Default master view)
  const detailsColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'plan',
        header: 'Tier & Insurer',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div>
              <span className="font-semibold text-xs text-[var(--color-text)] block">
                {details.plan} Tier
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {details.provider}
              </span>
            </div>
          );
        },
      },
      {
        id: 'dependents',
        header: 'Dependents',
        cell: ({ row }) => {
          const count = row.original.insurance?.dependents?.length || 0;
          return (
            <span className="text-xs font-mono text-[var(--color-text)]">
              {count > 0 ? `${count} declared` : 'Employee only'}
            </span>
          );
        },
      },
      {
        id: 'deadline',
        header: 'Window SLA',
        cell: ({ row }) => {
          const ins = row.original.insurance;
          if (!ins) return <span className="text-xs text-[var(--color-text-muted)]">—</span>;
          const today = new Date().toISOString().slice(0, 10);
          const isClosingSoon = ins.enrolmentStatus !== 'Active' && ins.deadlineDate <= today;

          return (
            <div className="text-xs">
              <span
                className={`font-mono ${
                  isClosingSoon ? 'text-red-600 dark:text-red-400 font-bold' : 'text-[var(--color-text)]'
                }`}
              >
                {ins.deadlineDate}
              </span>
              {isClosingSoon && (
                <span className="block text-[10px] text-red-600 font-semibold">Closing soon</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Enrolment Status',
        cell: ({ row }) => {
          const ins = row.original.insurance;
          return <StatusPill status={ins?.enrolmentStatus || 'Not Started'} />;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cand = row.original;
          const status = cand.insurance?.enrolmentStatus || 'Not Started';

          return (
            <div className="flex items-center justify-end gap-1.5">
              {(status === 'Not Started' || status === 'Invited') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
                  onClick={() => {
                    sendInsuranceInvite(cand.id);
                    toast.success(`Sent insurance enrolment invitation to ${cand.name}`);
                  }}
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> {status === 'Invited' ? 'Resend' : 'Invite'}
                </Button>
              )}

              {status === 'Submitted' && (
                <Button
                  size="sm"
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => {
                    approveInsuranceEnrolment(cand.id);
                    toast.success(`Approved group health policy for ${cand.name}`);
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => setActiveCandidate(cand)}
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> View
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer, sendInsuranceInvite, approveInsuranceEnrolment]
  );

  // Tab 2: Medical Insurance Columns
  const medicalColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate & Department',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.department}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'gmcCover',
        header: 'GMC Sum Insured',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs">
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50 inline-block">
                ₹{(details.gmcSum / 100000).toFixed(1)} Lakhs
              </span>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {details.plan} Tier Floater
              </p>
            </div>
          );
        },
      },
      {
        id: 'tpaNetwork',
        header: 'TPA & Cashless Network',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs">
              <p className="font-medium text-[var(--color-text)]">{details.tpa}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                10,500+ Hospital Network
              </p>
            </div>
          );
        },
      },
      {
        id: 'benefits',
        header: 'Included Medical Riders',
        cell: () => (
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 px-1.5 py-0.5 rounded font-medium">
              OPD & Diagnostics
            </span>
            <span className="text-[10px] bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 px-1.5 py-0.5 rounded font-medium">
              Maternity ₹75k
            </span>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Policy Status',
        cell: ({ row }) => <StatusPill status={row.original.insurance?.enrolmentStatus || 'Not Started'} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => setActiveCandidate(row.original)}
            >
              <HeartPulse className="w-3.5 h-3.5 mr-1 text-teal-500" /> Medical Card
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 3: Employee Insurance Columns (GTL Life Assurance)
  const employeeColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Insured Employee',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.role}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'gtlCover',
        header: 'Group Term Life (GTL) Cover',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs">
              <span className="font-mono font-bold text-[var(--color-text)]">
                ₹{(details.lifeCover / 100000).toFixed(0)} Lakhs
              </span>
              <p className="text-[10px] text-[var(--color-text-muted)]">3x Fixed Annual CTC</p>
            </div>
          );
        },
      },
      {
        id: 'nominee',
        header: 'Designated Nominee',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs text-[var(--color-text)] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span className="truncate max-w-[180px]">{details.nominee}</span>
            </div>
          );
        },
      },
      {
        id: 'ecard',
        header: 'Digital e-Card Status',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return details.ecardIssued ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Active & Generated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] bg-slate-500/10 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" /> Pending Activation
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => {
                toast.success(`e-Card link dispatched to ${row.original.name}`);
              }}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" /> e-Card
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 4: Accident Cover Columns (GPA Protection)
  const accidentColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.department}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'gpaCover',
        header: 'GPA Sum Insured',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs">
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50 inline-block">
                ₹{(details.gpaSum / 100000).toFixed(0)} Lakhs
              </span>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                24x7 Global Accident Shield
              </p>
            </div>
          );
        },
      },
      {
        id: 'disabilityBenefit',
        header: 'Permanent Disability Benefit',
        cell: () => (
          <div className="text-xs text-[var(--color-text)]">
            <span className="font-medium">100% Capital Sum</span>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              PTD & PPD Weekly Compensation
            </p>
          </div>
        ),
      },
      {
        id: 'traumaReimbursement',
        header: 'Emergency Trauma Limit',
        cell: () => (
          <span className="text-xs font-mono text-[var(--color-text)]">
            Up to ₹5,00,000 Incurred
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => setActiveCandidate(row.original)}
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-teal-500" /> Terms
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 5: Family Insurance Columns (Dependents Floater)
  const familyColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Primary Insured',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.department}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'floaterStructure',
        header: 'Floater Definition',
        cell: ({ row }) => {
          const deps = row.original.insurance?.dependents || [];
          return (
            <div className="text-xs">
              <span className="font-medium text-[var(--color-text)]">
                Self + {deps.length} {deps.length === 1 ? 'Dependent' : 'Dependents'}
              </span>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Shared Floater Sum Insured
              </p>
            </div>
          );
        },
      },
      {
        id: 'dependentsList',
        header: 'Covered Family Members',
        cell: ({ row }) => {
          const deps = row.original.insurance?.dependents || [];
          if (deps.length === 0) {
            return (
              <span className="text-xs text-[var(--color-text-muted)] italic">
                Individual employee only
              </span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-sm py-1">
              {deps.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1 text-[11px] bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] px-2 py-0.5 rounded-full"
                >
                  <span className="font-semibold text-teal-600">{d.relation}:</span> {d.name} ({d.dob.slice(0, 4)})
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => setActiveCandidate(row.original)}
            >
              <Users className="w-3.5 h-3.5 mr-1" /> Manage Family
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 6: Group Insurance Columns (Corporate Master Agreements)
  const groupColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate & Account',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.department}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'masterPolicy',
        header: 'Corporate Master Policy #',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded inline-block border border-teal-200/50 dark:border-teal-800/50">
              {details.masterPolicyNo}
            </div>
          );
        },
      },
      {
        id: 'underwriter',
        header: 'Primary Underwriter',
        cell: ({ row }) => {
          const details = getCandidateInsuranceDetails(row.original);
          return (
            <div className="text-xs text-[var(--color-text)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>{details.provider}</span>
            </div>
          );
        },
      },
      {
        id: 'premiumSplit',
        header: 'Premium Contribution',
        cell: () => (
          <div className="text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              100% Employer Funded
            </span>
            <p className="text-[10px] text-[var(--color-text-muted)]">Corporate Group Benefit</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => {
                toast.success(`Policy endorsement schedule generated for ${row.original.name}`);
              }}
            >
              Endorsement
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Active columns chosen dynamically per tab
  const columns = useMemo(() => {
    switch (activeTab) {
      case 'medical':
        return medicalColumns;
      case 'employee':
        return employeeColumns;
      case 'accident':
        return accidentColumns;
      case 'family':
        return familyColumns;
      case 'group':
        return groupColumns;
      case 'details':
      default:
        return detailsColumns;
    }
  }, [
    activeTab,
    detailsColumns,
    medicalColumns,
    employeeColumns,
    accidentColumns,
    familyColumns,
    groupColumns,
  ]);

  const handleBulkInvite = (selected: RecruiterCandidate[]) => {
    const ids = selected.map((c) => c.id);
    bulkSendInsuranceInvite(ids);
    toast.success(`Dispatched insurance enrolment invites to ${ids.length} candidates.`);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Insurance & Healthcare"
        subtitle="Administer corporate health policies, employee term life, accident covers, and family floater enrollments."
        breadcrumb="Insurance"
        actions={
          <Button
            variant="outline"
            className="text-xs text-teal-600 border-teal-500/30 hover:bg-teal-500/10 gap-1.5"
            onClick={() => {
              const pendingIds = candidates
                .filter(
                  (c) =>
                    !c.insurance ||
                    c.insurance.enrolmentStatus === 'Not Started' ||
                    c.insurance.enrolmentStatus === 'Invited'
                )
                .map((c) => c.id);
              bulkSendInsuranceInvite(pendingIds);
              toast.success(`Sent bulk reminders to ${pendingIds.length} candidate(s).`);
            }}
          >
            <Send className="w-3.5 h-3.5" /> Invite All Pending
          </Button>
        }
      />

      {/* Tabs Navigation (6 Tabs matching reference design) */}
      <div className="border-b border-[var(--color-border)] pb-3">
        <InsuranceTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />
        <p className="mt-2 text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <currentTabConfig.icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>{currentTabConfig.description}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        statusOptions={[
          { label: 'Not Started', value: 'Not Started' },
          { label: 'Invited', value: 'Invited' },
          { label: 'Submitted', value: 'Submitted' },
          { label: 'Active', value: 'Active' },
          { label: 'Waived', value: 'Waived' },
        ]}
        searchPlaceholder="Search candidate, provider, plan, dependent..."
      />

      {/* Table */}
      <DataTable
        data={filteredCandidates}
        columns={columns}
        searchKey="candidate"
        bulkActions={[
          {
            label: 'Send Enrolment Invites',
            icon: Send,
            onClick: handleBulkInvite,
          },
        ]}
      />

      {/* Insurance Detail Dialog */}
      <Dialog
        isOpen={!!currentCandidate}
        onClose={() => setActiveCandidate(null)}
        title={`Insurance Enrolment: ${currentCandidate?.name}`}
        size="lg"
      >
        {currentCandidate && currentCandidate.insurance && (
          <div className="space-y-5 pt-2">
            {/* Policy Info Card */}
            <div className="border-2 border-teal-500/30 rounded-2xl p-5 bg-gradient-to-br from-teal-500/10 via-[var(--color-surface)] to-[var(--color-surface)] shadow-md space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Corporate Health Assurance
                  </span>
                  <h3 className="text-lg font-bold text-[var(--color-text)]">
                    {currentCandidate.insurance.provider}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Tier {currentCandidate.insurance.plan} • ₹10,00,000 Sum Insured
                  </p>
                </div>
                <StatusPill status={currentCandidate.insurance.enrolmentStatus} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-[var(--color-surface)]/80 p-3 rounded-xl border border-[var(--color-border)] text-xs">
                <div>
                  <span className="text-[var(--color-text-muted)] block">Primary Insured:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currentCandidate.name}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">Nominee:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currentCandidate.insurance.nominee || 'Declared in Form'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block">Effective Date:</span>
                  <span className="font-mono text-[var(--color-text)]">
                    {currentCandidate.insurance.effectiveDate || 'Upon Day 1'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dependents List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Declared Dependents ({currentCandidate.insurance.dependents.length})
              </h4>
              <div className="space-y-2">
                {currentCandidate.insurance.dependents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--color-text-muted)] italic border border-dashed border-[var(--color-border)] rounded-lg">
                    No dependents added. Individual employee coverage.
                  </div>
                ) : (
                  currentCandidate.insurance.dependents.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{dep.name}</p>
                        <p className="text-[var(--color-text-muted)]">
                          Relationship: <span className="font-medium text-teal-600">{dep.relation}</span> • DOB: {dep.dob}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Covered
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions at bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                className="text-xs text-amber-600 hover:bg-amber-500/10"
                onClick={() => {
                  waiveInsurance(currentCandidate.id);
                  toast.info(`Insurance waived for ${currentCandidate.name}`);
                  setActiveCandidate(null);
                }}
              >
                <Ban className="w-3.5 h-3.5 mr-1" /> Mark Waived
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveCandidate(null)}>
                  Close
                </Button>
                {currentCandidate.insurance.enrolmentStatus !== 'Active' && (
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => {
                      approveInsuranceEnrolment(currentCandidate.id);
                      toast.success(`Activated policy for ${currentCandidate.name}`);
                      setActiveCandidate(null);
                    }}
                  >
                    Activate Policy
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
