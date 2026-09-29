import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plane,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Home,
  DollarSign,
  ChevronRight,
  FileText,
  Calendar,
  FolderCheck,
  Building2,
  ShieldAlert,
  CreditCard,
  Send,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, VisaCase, VisaStage, VisaType } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import {
  VISA_TABS,
  DEFAULT_VISA_TAB_ID,
  VALID_VISA_TAB_IDS,
  VisaTabId,
  VisaTabConfig,
} from './visa.constants';
import { VisaTabs } from './components/VisaTabs';

const STAGE_ORDER: VisaStage[] = [
  'Documents Collection',
  'Filed',
  'Under Review',
  'Approved',
  'Visa Stamped',
  'Travel Ready',
];

// Helper to provide realistic defaults if optional fields are missing from older mock data
const getVisaDetails = (candidate: RecruiterCandidate) => {
  const v = candidate.visa;
  const hash = candidate.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const visaNumber = v?.visaNumber || `V-${candidate.id.replace('CAND-', '')}-${1000 + (hash % 8999)}`;
  const issueDate = v?.issueDate || v?.filingDate || '2026-09-15';
  const expiryDate =
    v?.expiryDate ||
    (v?.stage === 'Travel Ready' || v?.stage === 'Approved'
      ? '2028-09-30'
      : hash % 2 === 0
      ? '2026-11-30'
      : '2027-04-15');
  const passportExpiry = v?.passportExpiry || '2030-05-20';
  const sponsoringEntity =
    v?.sponsoringEntity ||
    (v?.toCountry === 'United Kingdom'
      ? 'Onboardly Technologies UK Ltd'
      : v?.toCountry === 'Singapore'
      ? 'Onboardly APAC Pte Ltd'
      : 'Onboardly Global Inc.');

  const filingFee = v?.costs?.filingFee ?? 460;
  const legalFee = v?.costs?.legalFee ?? 2500;
  const premiumProcessing = v?.costs?.premiumProcessing ?? (hash % 2 === 0 ? 1500 : 0);
  const flights = v?.costs?.flights ?? 1200;
  const relocationGrant = v?.costs?.relocationGrant ?? 3000;
  const totalCost =
    v?.costs?.totalCost ?? filingFee + legalFee + premiumProcessing + flights + relocationGrant;
  const currency = v?.costs?.currency ?? 'USD';

  return {
    visaNumber,
    issueDate,
    expiryDate,
    passportExpiry,
    sponsoringEntity,
    costs: {
      filingFee,
      legalFee,
      premiumProcessing,
      flights,
      relocationGrant,
      totalCost,
      currency,
    },
  };
};

export const VisaPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as VisaTabId | null;
  const activeTab: VisaTabId =
    rawTab && VALID_VISA_TAB_IDS.includes(rawTab) ? rawTab : DEFAULT_VISA_TAB_ID;

  const handleTabChange = (tabId: VisaTabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === DEFAULT_VISA_TAB_ID) {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    });
  };

  const currentTabConfig: VisaTabConfig = useMemo(
    () => VISA_TABS.find((t) => t.id === activeTab) ?? VISA_TABS[0]!,
    [activeTab]
  );

  const candidates = useHiringStore((state) => state.candidates);
  const addVisaCase = useHiringStore((state) => state.addVisaCase);
  const updateVisaStage = useHiringStore((state) => state.updateVisaStage);
  const toggleVisaChecklistItem = useHiringStore((state) => state.toggleVisaChecklistItem);
  const addVisaNote = useHiringStore((state) => state.addVisaNote);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Selected candidate for Case Detail Sheet/Dialog
  const [activeCaseCandidate, setActiveCaseCandidate] = useState<RecruiterCandidate | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Add Case Dialog State
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [newCaseData, setNewCaseData] = useState<Partial<VisaCase>>({
    fromCountry: 'India',
    toCountry: 'Singapore',
    visaType: 'Work Permit',
    stage: 'Documents Collection',
    lawyerVendor: 'Fragomen Global LLP',
    filingDate: '2026-10-01',
    expectedDecision: '2026-11-15',
    startRisk: false,
    relocationSupport: {
      flightBooked: false,
      housingAssisted: true,
      relocationAllowance: true,
    },
    checklist: [
      { id: 'vc-1', task: 'Valid Passport (>6 months validity)', completed: true },
      { id: 'vc-2', task: 'Apostilled Educational Degree Certificates', completed: true },
      { id: 'vc-3', task: 'Employer Petition & Sponsorship Letter', completed: false },
      { id: 'vc-4', task: 'Medical Examination & Biometrics', completed: false },
    ],
    notes: [
      {
        id: 'vn-1',
        author: 'Immigration Specialist (Meera Roy)',
        text: 'Initial intake completed. Awaiting final degree apostille seal.',
        date: '2026-09-28',
      },
    ],
  });

  // Get active candidate synced with store
  const currentCandidate = useMemo(() => {
    if (!activeCaseCandidate) return null;
    return candidates.find((c) => c.id === activeCaseCandidate.id) || null;
  }, [candidates, activeCaseCandidate]);

  // Candidates who have visa cases
  const visaCandidates = useMemo(() => {
    return candidates.filter((c) => c.visa && c.visa.needsVisa);
  }, [candidates]);

  // Candidates eligible for new visa case
  const nonVisaCandidates = useMemo(() => {
    return candidates.filter((c) => !c.visa || !c.visa.needsVisa);
  }, [candidates]);

  // Tab counts for badge badges in Tab pill headers
  const tabCounts = useMemo<Record<string, number>>(() => {
    const totalVisas = visaCandidates.length;
    const expiringSoon = visaCandidates.filter((cand) => {
      const details = getVisaDetails(cand);
      const exp = new Date(details.expiryDate).getTime();
      const now = new Date('2026-09-29').getTime();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 90;
    }).length;

    const totalDocs = visaCandidates.reduce(
      (acc, c) => acc + (c.visa?.checklist?.length || 0),
      0
    );

    return {
      status: totalVisas,
      details: totalVisas,
      expiry: expiringSoon,
      documents: totalDocs,
      cost: totalVisas,
    };
  }, [visaCandidates]);

  // Filtered rows
  const filteredVisaCandidates = useMemo(() => {
    return visaCandidates.filter((cand) => {
      const v = cand.visa;
      if (!v) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const details = getVisaDetails(cand);
        const matchName = cand.name.toLowerCase().includes(q);
        const matchFrom = v.fromCountry.toLowerCase().includes(q);
        const matchTo = v.toCountry.toLowerCase().includes(q);
        const matchType = v.visaType.toLowerCase().includes(q);
        const matchNumber = details.visaNumber.toLowerCase().includes(q);
        const matchLawyer = (v.lawyerVendor || '').toLowerCase().includes(q);
        const matchEntity = details.sponsoringEntity.toLowerCase().includes(q);
        if (
          !matchName &&
          !matchFrom &&
          !matchTo &&
          !matchType &&
          !matchNumber &&
          !matchLawyer &&
          !matchEntity
        ) {
          return false;
        }
      }
      if (filters.status && v.stage !== filters.status) return false;
      if (filters.department && cand.department !== filters.department) return false;
      return true;
    });
  }, [visaCandidates, filters]);

  // Tab-specific dynamic KPI cards
  const stats = useMemo<StatItem[]>(() => {
    const total = visaCandidates.length;

    switch (activeTab) {
      case 'details': {
        const workPermits = visaCandidates.filter((c) => c.visa?.visaType === 'Work Permit').length;
        const specialty = visaCandidates.filter(
          (c) => c.visa?.visaType === 'H-1B' || c.visa?.visaType === 'Blue Card'
        ).length;
        const intraCompany = visaCandidates.filter(
          (c) => c.visa?.visaType === 'Intra-company'
        ).length;
        return [
          {
            id: 'active-authorizations',
            label: 'Active Petitions',
            value: total,
            subtitle: 'Registered visa dockets',
            icon: FileText,
          },
          {
            id: 'work-permits',
            label: 'Work Permits & Passes',
            value: workPermits,
            subtitle: 'MOM & UKVI standard passes',
            icon: Globe2,
            variant: 'teal',
          },
          {
            id: 'specialty-visas',
            label: 'Specialty & Blue Cards',
            value: specialty,
            subtitle: 'High-skill technical tier',
            icon: Building2,
            variant: 'default',
          },
          {
            id: 'intra-company',
            label: 'Intra-Company Transfers',
            value: intraCompany,
            subtitle: 'Cross-entity global mobility',
            icon: Plane,
            variant: 'success',
          },
        ];
      }

      case 'expiry': {
        let critical = 0; // <60 days
        let warning = 0; // 60-180 days
        let healthy = 0; // >180 days
        const now = new Date('2026-09-29').getTime();

        visaCandidates.forEach((c) => {
          const details = getVisaDetails(c);
          const exp = new Date(details.expiryDate).getTime();
          const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          if (diffDays <= 60) critical++;
          else if (diffDays <= 180) warning++;
          else healthy++;
        });

        return [
          {
            id: 'total-tracked',
            label: 'Visas Monitored',
            value: total,
            subtitle: 'Expat renewal lifecycle',
            icon: Calendar,
          },
          {
            id: 'urgent-expiry',
            label: 'Expiring <60 Days',
            value: critical,
            subtitle: 'Immediate renewal required',
            icon: ShieldAlert,
            variant: 'danger',
          },
          {
            id: 'upcoming-expiry',
            label: 'Expiring 60–180 Days',
            value: warning,
            subtitle: 'Prepare filing documents',
            icon: Clock,
            variant: 'warning',
          },
          {
            id: 'healthy-expiry',
            label: 'Compliant (>6 Months)',
            value: healthy,
            subtitle: 'Valid authorizations',
            icon: CheckCircle2,
            variant: 'success',
          },
        ];
      }

      case 'documents': {
        let totalDocs = 0;
        let completedDocs = 0;
        let pendingDocs = 0;

        visaCandidates.forEach((c) => {
          const list = c.visa?.checklist || [];
          totalDocs += list.length;
          list.forEach((item) => {
            if (item.completed) completedDocs++;
            else pendingDocs++;
          });
        });

        const verifiedRate = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

        return [
          {
            id: 'total-docs',
            label: 'Dossier Items Tracked',
            value: totalDocs,
            subtitle: 'Passports, apostilles & petitions',
            icon: FolderCheck,
          },
          {
            id: 'completed-docs',
            label: 'Verified & Cleared',
            value: completedDocs,
            subtitle: 'Authenticated certificates',
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'pending-docs',
            label: 'Pending Submission',
            value: pendingDocs,
            subtitle: 'Awaiting candidate or authority',
            icon: Clock,
            variant: 'warning',
          },
          {
            id: 'completion-rate',
            label: 'Dossier Readiness',
            value: `${verifiedRate}%`,
            subtitle: 'Overall immigration dossier health',
            icon: Sparkles,
            variant: 'teal',
          },
        ];
      }

      case 'cost': {
        let grandTotal = 0;
        let legalTotal = 0;
        let filingTotal = 0;
        let reloTotal = 0;

        visaCandidates.forEach((c) => {
          const details = getVisaDetails(c);
          grandTotal += details.costs.totalCost;
          legalTotal += details.costs.legalFee;
          filingTotal += details.costs.filingFee + details.costs.premiumProcessing;
          reloTotal += details.costs.flights + details.costs.relocationGrant;
        });

        return [
          {
            id: 'total-spend',
            label: 'Total Immigration Spend',
            value: `$${grandTotal.toLocaleString()}`,
            subtitle: 'Committed mobility budget',
            icon: DollarSign,
            variant: 'teal',
          },
          {
            id: 'legal-spend',
            label: 'Attorney & Counsel Fees',
            value: `$${legalTotal.toLocaleString()}`,
            subtitle: 'Retained immigration firms',
            icon: CreditCard,
          },
          {
            id: 'gov-fees',
            label: 'Govt & Filing Fees',
            value: `$${filingTotal.toLocaleString()}`,
            subtitle: 'Embassy & expedited processing',
            icon: Globe2,
          },
          {
            id: 'relo-grants',
            label: 'Relocation & Travel',
            value: `$${reloTotal.toLocaleString()}`,
            subtitle: 'Flights and relocation stipends',
            icon: Plane,
            variant: 'success',
          },
        ];
      }

      case 'status':
      default: {
        const travelReady = visaCandidates.filter((c) => c.visa?.stage === 'Travel Ready').length;
        const underReview = visaCandidates.filter(
          (c) => c.visa?.stage === 'Under Review' || c.visa?.stage === 'Filed'
        ).length;
        const atRisk = visaCandidates.filter(
          (c) => c.visa?.startRisk || c.visa?.stage === 'RFE'
        ).length;

        return [
          {
            id: 'total-visa',
            label: 'International Relocations',
            value: total,
            subtitle: 'Immigration & work permit cases',
            icon: Globe2,
          },
          {
            id: 'processing',
            label: 'Government Review',
            value: underReview,
            subtitle: 'Petitions with foreign embassies',
            icon: Clock,
            variant: 'teal',
          },
          {
            id: 'travel-ready',
            label: 'Travel Ready & Stamped',
            value: travelReady,
            subtitle: 'Cleared for departure',
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'start-risk',
            label: 'Start-Date Risk',
            value: atRisk,
            subtitle: 'RFE or delayed decision',
            icon: AlertTriangle,
            variant: 'danger',
          },
        ];
      }
    }
  }, [activeTab, visaCandidates]);

  // Tab 1: Visa Status Columns
  const statusColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
        id: 'corridor',
        header: 'Relocation Route',
        cell: ({ row }) => {
          const v = row.original.visa;
          return (
            <div className="text-xs flex items-center gap-1.5 font-medium text-[var(--color-text)]">
              <span>{v?.fromCountry}</span>
              <Plane className="w-3 h-3 text-teal-500" />
              <span>{v?.toCountry}</span>
            </div>
          );
        },
      },
      {
        id: 'visaType',
        header: 'Visa Category',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            {row.original.visa?.visaType}
          </span>
        ),
      },
      {
        id: 'lawyer',
        header: 'Legal Counsel',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text)]">{row.original.visa?.lawyerVendor}</span>
        ),
      },
      {
        id: 'decisionDate',
        header: 'Target Decision',
        cell: ({ row }) => {
          const v = row.original.visa;
          return (
            <div className="text-xs">
              <p className="text-[var(--color-text)] font-mono">{v?.expectedDecision}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Filed: {v?.filingDate}</p>
            </div>
          );
        },
      },
      {
        id: 'stage',
        header: 'Case Stage',
        cell: ({ row }) => {
          const v = row.original.visa;
          return (
            <div>
              <StatusPill status={v?.stage || 'Under Review'} />
              {v?.startRisk && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 mt-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Start Date Risk
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
                onClick={() => setActiveCaseCandidate(cand)}
              >
                Case File <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 2: Visa Details Columns
  const detailsColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate & Role',
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
        id: 'visaRef',
        header: 'Visa Reference #',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded inline-block border border-teal-200/50 dark:border-teal-800/50">
              {details.visaNumber}
            </div>
          );
        },
      },
      {
        id: 'visaType',
        header: 'Visa Classification',
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="font-medium text-[var(--color-text)]">
              {row.original.visa?.visaType}
            </span>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {row.original.visa?.fromCountry} → {row.original.visa?.toCountry}
            </p>
          </div>
        ),
      },
      {
        id: 'sponsoringEntity',
        header: 'Sponsoring Employer Entity',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs flex items-center gap-1.5 text-[var(--color-text)]">
              <Building2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span className="truncate max-w-[200px]">{details.sponsoringEntity}</span>
            </div>
          );
        },
      },
      {
        id: 'counsel',
        header: 'Immigration Firm',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text)]">
            {row.original.visa?.lawyerVendor || 'Fragomen Global LLP'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
              onClick={() => setActiveCaseCandidate(row.original)}
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Details
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 3: Visa Expiry Columns
  const expiryColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
        id: 'visaExpiry',
        header: 'Visa Expiration Date',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs">
              <span className="font-mono font-semibold text-[var(--color-text)]">
                {details.expiryDate}
              </span>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Issued: {details.issueDate}
              </p>
            </div>
          );
        },
      },
      {
        id: 'remainingDays',
        header: 'Validity Status',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          const exp = new Date(details.expiryDate).getTime();
          const now = new Date('2026-09-29').getTime();
          const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

          if (diffDays <= 60) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                <AlertTriangle className="w-3 h-3" />
                {diffDays > 0 ? `${diffDays} days left` : 'Expired'}
              </span>
            );
          }
          if (diffDays <= 180) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Clock className="w-3 h-3" />
                {diffDays} days remaining
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              {diffDays} days (Valid)
            </span>
          );
        },
      },
      {
        id: 'passportExpiry',
        header: 'Passport Expiration',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs text-[var(--color-text)] font-mono">
              {details.passportExpiry}
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
              onClick={() => {
                toast.success(`Extension window recorded for ${row.original.name}`);
              }}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Initiate Renewal
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Tab 4: Documents Columns
  const documentsColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
        id: 'dossierChecklist',
        header: 'Immigration Dossier Items',
        cell: ({ row }) => {
          const cand = row.original;
          const items = cand.visa?.checklist || [];
          return (
            <div className="space-y-1.5 max-w-md py-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleVisaChecklistItem(cand.id, item.id)}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                      item.completed
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </div>
                  <span
                    className={
                      item.completed
                        ? 'line-through text-[var(--color-text-muted)] text-[11px]'
                        : 'text-[var(--color-text)] font-medium text-[11px]'
                    }
                  >
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: 'dossierProgress',
        header: 'Completion Status',
        cell: ({ row }) => {
          const items = row.original.visa?.checklist || [];
          const completed = items.filter((i) => i.completed).length;
          const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

          return (
            <div className="text-xs space-y-1 w-32">
              <div className="flex justify-between text-[11px] font-medium text-[var(--color-text)]">
                <span>
                  {completed}/{items.length} Cleared
                </span>
                <span className="font-bold text-teal-600">{pct}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-2)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
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
              onClick={() => setActiveCaseCandidate(row.original)}
            >
              Review Dossier <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer, toggleVisaChecklistItem]
  );

  // Tab 5: Cost Columns
  const costColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {cand.visa?.fromCountry} → {cand.visa?.toCountry}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'filingFees',
        header: 'Govt Filing Fees',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs font-mono text-[var(--color-text)]">
              ${details.costs.filingFee.toLocaleString()}
            </div>
          );
        },
      },
      {
        id: 'legalFees',
        header: 'Legal Counsel',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs font-mono text-[var(--color-text)]">
              ${details.costs.legalFee.toLocaleString()}
            </div>
          );
        },
      },
      {
        id: 'premiumProcessing',
        header: 'Expedited / Premium',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs font-mono text-[var(--color-text)]">
              ${details.costs.premiumProcessing.toLocaleString()}
            </div>
          );
        },
      },
      {
        id: 'relocationGrant',
        header: 'Relocation & Travel',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          const travel = details.costs.flights + details.costs.relocationGrant;
          return (
            <div className="text-xs">
              <p className="font-mono text-[var(--color-text)]">${travel.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Flight: ${details.costs.flights} | Stipend: ${details.costs.relocationGrant}
              </p>
            </div>
          );
        },
      },
      {
        id: 'totalCost',
        header: 'Total Investment',
        cell: ({ row }) => {
          const details = getVisaDetails(row.original);
          return (
            <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded inline-block border border-teal-200/50 dark:border-teal-800/50">
              ${details.costs.totalCost.toLocaleString()} {details.costs.currency}
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
              onClick={() => {
                toast.success(`Ledger downloaded for ${row.original.name}`);
              }}
            >
              Invoice Breakdown
            </Button>
          </div>
        ),
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Active columns selected based on current active tab
  const columns = useMemo(() => {
    switch (activeTab) {
      case 'details':
        return detailsColumns;
      case 'expiry':
        return expiryColumns;
      case 'documents':
        return documentsColumns;
      case 'cost':
        return costColumns;
      case 'status':
      default:
        return statusColumns;
    }
  }, [activeTab, statusColumns, detailsColumns, expiryColumns, documentsColumns, costColumns]);

  const handleCreateCase = () => {
    if (!selectedCandidateId) {
      toast.error('Select an eligible candidate.');
      return;
    }
    addVisaCase(selectedCandidateId, newCaseData);
    const chosen = candidates.find((c) => c.id === selectedCandidateId);
    toast.success(`Opened immigration case for ${chosen?.name}`);
    setIsAddCaseOpen(false);
  };

  const handleAddNote = () => {
    if (!currentCandidate || !newNoteText.trim()) return;
    addVisaNote(currentCandidate.id, newNoteText.trim());
    toast.success('Appended note to case timeline');
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Visa & Immigration"
        subtitle="Coordinate work permits, embassy filings, consular interviews, and expat relocation support."
        breadcrumb="Visa & Immigration"
        actions={
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
            onClick={() => {
              if (nonVisaCandidates.length > 0) {
                setSelectedCandidateId(nonVisaCandidates[0]?.id || '');
              }
              setIsAddCaseOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Open Visa Case
          </Button>
        }
      />

      {/* Tabs Navigation (5 Tabs matching design) */}
      <div className="border-b border-[var(--color-border)] pb-3">
        <VisaTabs
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
          { label: 'Documents Collection', value: 'Documents Collection' },
          { label: 'Filed', value: 'Filed' },
          { label: 'Under Review', value: 'Under Review' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Visa Stamped', value: 'Visa Stamped' },
          { label: 'Travel Ready', value: 'Travel Ready' },
          { label: 'RFE', value: 'RFE' },
        ]}
        searchPlaceholder="Search candidate, country, visa reference, legal counsel..."
      />

      {/* Table */}
      <DataTable data={filteredVisaCandidates} columns={columns} searchKey="candidate" />

      {/* Case Detail Dialog */}
      <Dialog
        isOpen={!!currentCandidate}
        onClose={() => setActiveCaseCandidate(null)}
        title={`Immigration File: ${currentCandidate?.name}`}
        size="lg"
      >
        {currentCandidate && currentCandidate.visa && (
          <div className="space-y-6 pt-2">
            {/* Stage Selector */}
            <div className="bg-[var(--color-surface-2)] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Progress Pipeline
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Current: <span className="font-semibold text-teal-600">{currentCandidate.visa.stage}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {STAGE_ORDER.map((stage, idx) => {
                  const isCurrent = currentCandidate.visa?.stage === stage;
                  const currentIdx = STAGE_ORDER.indexOf(currentCandidate.visa?.stage as VisaStage);
                  const isPassed = currentIdx >= idx;

                  return (
                    <button
                      key={stage}
                      type="button"
                      className={`p-2 rounded-lg text-left text-xs transition-all border ${
                        isCurrent
                          ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-xs'
                          : isPassed
                          ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-teal-500/30'
                      }`}
                      onClick={() => {
                        updateVisaStage(currentCandidate.id, stage);
                        toast.success(`Updated case stage to ${stage}`);
                      }}
                    >
                      <span className="block text-[10px] opacity-75">Step {idx + 1}</span>
                      <span className="truncate block font-medium">{stage}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relocation Support Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
                <Plane className="w-5 h-5 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Flight Ticket</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {currentCandidate.visa.relocationSupport.flightBooked
                      ? 'Booked & Issued'
                      : 'Pending Approval'}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
                <Home className="w-5 h-5 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Temporary Housing</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {currentCandidate.visa.relocationSupport.housingAssisted
                      ? '30 Days Arranged'
                      : 'Not Opted'}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Relocation Stipend</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {currentCandidate.visa.relocationSupport.relocationAllowance
                      ? '₹2,50,000 Disbursed'
                      : 'Standard'}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Embassy & Dossier Checklist
              </h4>
              <div className="space-y-1.5 border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-surface-2)]">
                {currentCandidate.visa.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-1.5 hover:bg-[var(--color-surface)] rounded cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-[var(--color-border)] text-teal-600 focus:ring-teal-500"
                      checked={item.completed}
                      onChange={() => toggleVisaChecklistItem(currentCandidate.id, item.id)}
                    />
                    <span
                      className={
                        item.completed
                          ? 'line-through text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text)] font-medium'
                      }
                    >
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Counsel Notes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Legal Counsel Log & Updates
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {currentCandidate.visa.notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span className="font-semibold text-[var(--color-text)]">{n.author}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-[var(--color-text)]">{n.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <Input
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record an immigration update or consular appointment date..."
                  className="text-xs"
                />
                <Button size="sm" className="bg-teal-600 text-white shrink-0" onClick={handleAddNote}>
                  Post Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Case Dialog */}
      <Dialog
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        title="Open Relocation & Visa Case"
        size="lg"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Candidate
            </label>
            <Select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
            >
              {nonVisaCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.candidateId}) — {c.role} [{c.location}]
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Origin Country
              </label>
              <Input
                value={newCaseData.fromCountry}
                onChange={(e) => setNewCaseData({ ...newCaseData, fromCountry: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Destination Country
              </label>
              <Input
                value={newCaseData.toCountry}
                onChange={(e) => setNewCaseData({ ...newCaseData, toCountry: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Visa Category
              </label>
              <Select
                value={newCaseData.visaType}
                onChange={(e) =>
                  setNewCaseData({ ...newCaseData, visaType: e.target.value as VisaType })
                }
              >
                <option value="Work Permit">Work Permit</option>
                <option value="H-1B">H-1B Specialty Occupation</option>
                <option value="Blue Card">EU Blue Card</option>
                <option value="Intra-company">Intra-company Transfer</option>
                <option value="Other">Other Global Mobility</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Retained Legal Counsel
              </label>
              <Input
                value={newCaseData.lawyerVendor}
                onChange={(e) =>
                  setNewCaseData({ ...newCaseData, lawyerVendor: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Expected Decision Date
              </label>
              <Input
                type="date"
                value={newCaseData.expectedDecision}
                onChange={(e) =>
                  setNewCaseData({ ...newCaseData, expectedDecision: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button variant="ghost" onClick={() => setIsAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCreateCase}
            >
              Initialize File
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
