import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Clock,
  Send,
  CheckCircle2,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, CandidateOffer } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

type OfferStatus = CandidateOffer['status'];

const KANBAN_STAGES: { id: OfferStatus; title: string; color: string }[] = [
  { id: 'Draft', title: 'Drafting', color: 'border-slate-500/30' },
  { id: 'Pending Approval', title: 'Pending Approval', color: 'border-amber-500/30' },
  { id: 'Released', title: 'Released & Out', color: 'border-teal-500/30' },
  { id: 'Accepted', title: 'Offer Accepted', color: 'border-emerald-500/30' },
  { id: 'Declined', title: 'Declined / Expired', color: 'border-red-500/30' },
];

export const OffersPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const candidates = useHiringStore((state) => state.candidates);
  const createOffer = useHiringStore((state) => state.createOffer);
  const submitOfferForApproval = useHiringStore((state) => state.submitOfferForApproval);
  const approveOffer = useHiringStore((state) => state.approveOffer);
  const releaseOffer = useHiringStore((state) => state.releaseOffer);
  const withdrawOffer = useHiringStore((state) => state.withdrawOffer);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Create / Revise Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || '');
  const [offerForm, setOfferForm] = useState({
    role: 'Senior Frontend Engineer',
    band: 'L5',
    department: 'Engineering',
    location: 'Bengaluru, India',
    annualCTC: '₹34,50,000 INR',
    joiningBonus: '₹3,00,000 INR',
    equityGrant: '1,200 Stock Options',
    joiningDate: '2026-10-15',
    reportingManager: 'Vikram Malhotra',
    expiryDays: '7',
  });

  // Filtered candidate offers
  const candidatesWithOffers = useMemo(() => {
    return candidates.filter((c) => {
      if (!c.offer) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchId = (c.candidateId || c.candidateCode || c.id || '').toLowerCase().includes(q);
        const matchRole = (c.offer.role || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRole) return false;
      }
      if (filters.status && c.offer.status !== filters.status) return false;
      if (filters.department && c.department !== filters.department) return false;
      if (filters.location && c.location !== filters.location) return false;
      return true;
    });
  }, [candidates, filters]);

  // Stat Summary Cards
  const stats = useMemo<StatItem[]>(() => {
    const withOffers = candidates.filter((c) => c.offer);
    const total = withOffers.length;
    const pendingApproval = withOffers.filter((c) => c.offer?.status === 'Pending Approval').length;
    const released = withOffers.filter((c) => c.offer?.status === 'Released').length;
    const accepted = withOffers.filter((c) => c.offer?.status === 'Accepted').length;
    const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return [
      {
        id: 'total-offers',
        label: 'Total Active Offers',
        value: total,
        subtitle: 'Across hiring pipelines',
        icon: FileText,
      },
      {
        id: 'pending-approval',
        label: 'Pending HR Approval',
        value: pendingApproval,
        subtitle: 'Requires VP/Director sign-off',
        icon: Clock,
        variant: 'neutral',
      },
      {
        id: 'released',
        label: 'Released & Awaiting',
        value: released,
        subtitle: 'Viewable by candidates',
        icon: Send,
        variant: 'teal',
      },
      {
        id: 'accepted',
        label: 'Offer Acceptance Rate',
        value: `${rate}%`,
        subtitle: `${accepted} offers accepted`,
        icon: TrendingUp,
        variant: 'success',
      },
    ];
  }, [candidates]);

  const columns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
        id: 'roleDetails',
        header: 'Offered Role & CTC',
        cell: ({ row }) => {
          const offer = row.original.offer;
          return (
            <div>
              <p className="font-medium text-xs text-[var(--color-text)]">{offer?.role}</p>
              <p className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                {offer?.annualCTC}
              </p>
            </div>
          );
        },
      },
      {
        id: 'version',
        header: 'Rev',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            v{row.original.offer?.version || 1}
          </span>
        ),
      },
      {
        id: 'dates',
        header: 'Key Dates',
        cell: ({ row }) => {
          const offer = row.original.offer;
          return (
            <div className="text-xs space-y-0.5">
              <p className="text-[var(--color-text)]">
                Join: <span className="font-medium">{offer?.joiningDate}</span>
              </p>
              <p className="text-[var(--color-text-muted)] text-[11px]">
                Expires: {offer?.expiryDate}
              </p>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Offer Status',
        cell: ({ row }) => {
          const offer = row.original.offer;
          return (
            <div>
              <StatusPill status={offer?.status || 'Draft'} />
              {offer?.status === 'Accepted' && offer.acceptedAt && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Accepted {new Date(offer.acceptedAt).toLocaleDateString()}
                </p>
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
          const status = cand.offer?.status;

          return (
            <div className="flex items-center justify-end gap-1.5">
              {status === 'Draft' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs hover:border-amber-500 hover:text-amber-600"
                  onClick={() => {
                    submitOfferForApproval(cand.id);
                    toast.success(`Submitted offer for ${cand.name} to HR Leadership approval.`);
                  }}
                >
                  Submit for Approval
                </Button>
              )}

              {status === 'Pending Approval' && (
                <Button
                  size="sm"
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => {
                    approveOffer(cand.id);
                    toast.success(`Approved offer for ${cand.name}`);
                  }}
                >
                  Approve Offer
                </Button>
              )}

              {(status === 'Pending Approval' || status === 'Draft') && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-teal-600 hover:bg-teal-500/10"
                  onClick={() => {
                    releaseOffer(cand.id);
                    toast.success(`Released offer for ${cand.name}! Pushed to candidate portal.`);
                  }}
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Quick Release
                </Button>
              )}

              {status === 'Released' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
                    onClick={() => {
                      releaseOffer(cand.id);
                      toast.info(`Offer re-sent to candidate portal for ${cand.name}`);
                    }}
                  >
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-red-600 hover:bg-red-500/10"
                    onClick={() => {
                      withdrawOffer(cand.id);
                      toast.warning(`Withdrawn active offer for ${cand.name}`);
                    }}
                  >
                    Withdraw
                  </Button>
                </>
              )}

              {status === 'Accepted' && (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Day 1
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [
      onOpenCandidateDrawer,
      submitOfferForApproval,
      approveOffer,
      releaseOffer,
      withdrawOffer,
    ]
  );

  const handleCreateOffer = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(offerForm.expiryDays || 7));

    createOffer(selectedCandidateId, {
      role: offerForm.role,
      band: offerForm.band,
      department: offerForm.department,
      location: offerForm.location,
      annualCTC: offerForm.annualCTC,
      joiningBonus: offerForm.joiningBonus,
      equityGrant: offerForm.equityGrant,
      joiningDate: offerForm.joiningDate,
      reportingManager: offerForm.reportingManager,
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'Pending Approval',
    });

    const chosen = candidates.find((c) => c.id === selectedCandidateId);
    toast.success(`Drafted and submitted employment offer for ${chosen?.name}`);
    setIsCreateOpen(false);
    setCreateStep(1);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Offer Pipeline"
        subtitle="Generate compensation letters, route for internal approval, and push live offers to candidates."
        breadcrumb="Offers"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Pipeline Board
              </button>
            </div>

            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4" /> Create Offer
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        statusOptions={[
          { label: 'Draft', value: 'Draft' },
          { label: 'Pending Approval', value: 'Pending Approval' },
          { label: 'Released', value: 'Released' },
          { label: 'Accepted', value: 'Accepted' },
          { label: 'Declined', value: 'Declined' },
        ]}
        searchPlaceholder="Search candidate, role, ID..."
      />

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <DataTable data={candidatesWithOffers} columns={columns} searchKey="candidate" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((col) => {
            const stageCandidates = candidatesWithOffers.filter(
              (c) =>
                c.offer?.status === col.id ||
                (col.id === 'Declined' && (c.offer?.status === 'Declined' || c.offer?.status === 'Expired'))
            );

            return (
              <div
                key={col.id}
                className="bg-[var(--color-surface-2)]/60 rounded-xl p-3 border border-[var(--color-border)] flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                    {col.title}
                  </span>
                  <span className="text-xs font-mono font-semibold bg-[var(--color-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {stageCandidates.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)] italic">
                      No offers in this stage
                    </div>
                  ) : (
                    stageCandidates.map((c) => (
                      <div
                        key={c.id}
                        className="bg-[var(--color-surface)] p-3.5 rounded-lg border border-[var(--color-border)] shadow-xs hover:border-teal-500/40 cursor-pointer transition-all space-y-2.5"
                        onClick={() => onOpenCandidateDrawer(c)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-xs text-[var(--color-text)]">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">
                              {c.offer?.role}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                            v{c.offer?.version || 1}
                          </span>
                        </div>

                        <div className="bg-[var(--color-surface-2)] p-2 rounded text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                          {c.offer?.annualCTC}
                        </div>

                        <div className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
                          <span>Start: {c.offer?.joiningDate}</span>
                          {c.offer?.status === 'Released' && (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Offer Multi-Step Dialog with Live Preview */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateStep(1);
        }}
        title={createStep === 1 ? 'Step 1: Offer Terms & Compensation' : 'Step 2: Candidate Live Preview'}
        size="lg"
      >
        {createStep === 1 ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Select Candidate
              </label>
              <Select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.candidateId}) — {c.role} [{c.department}]
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Designation / Role Title
                </label>
                <Input
                  value={offerForm.role}
                  onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Level / Band
                </label>
                <Select
                  value={offerForm.band}
                  onChange={(e) => setOfferForm({ ...offerForm, band: e.target.value })}
                >
                  <option value="L3">L3 - Associate</option>
                  <option value="L4">L4 - Mid Specialist</option>
                  <option value="L5">L5 - Senior Engineer / Lead</option>
                  <option value="L6">L6 - Staff / Principal</option>
                  <option value="M1">M1 - Engineering Manager</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Annual Fixed CTC
                </label>
                <Input
                  value={offerForm.annualCTC}
                  onChange={(e) => setOfferForm({ ...offerForm, annualCTC: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Joining Bonus
                </label>
                <Input
                  value={offerForm.joiningBonus}
                  onChange={(e) => setOfferForm({ ...offerForm, joiningBonus: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  ESOP / Equity Units
                </label>
                <Input
                  value={offerForm.equityGrant}
                  onChange={(e) => setOfferForm({ ...offerForm, equityGrant: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Joining Date
                </label>
                <Input
                  type="date"
                  value={offerForm.joiningDate}
                  onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Reporting Manager
                </label>
                <Input
                  value={offerForm.reportingManager}
                  onChange={(e) => setOfferForm({ ...offerForm, reportingManager: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                  Offer Validity (Days)
                </label>
                <Select
                  value={offerForm.expiryDays}
                  onChange={(e) => setOfferForm({ ...offerForm, expiryDays: e.target.value })}
                >
                  <option value="3">3 Days (Urgent)</option>
                  <option value="7">7 Days (Standard)</option>
                  <option value="14">14 Days (Extended)</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                onClick={() => setCreateStep(2)}
              >
                Preview Offer Card <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Live Candidate Offer Card Preview */
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-teal-500/10 text-teal-800 dark:text-teal-300 rounded-lg text-xs flex items-center gap-2 border border-teal-500/20">
              <Sparkles className="w-4 h-4 shrink-0" />
              This is the exact view the candidate will see in their portal upon release.
            </div>

            {/* Offer Card Preview Box */}
            <div className="border-2 border-teal-500/30 rounded-2xl p-6 bg-[var(--color-surface)] shadow-lg space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Official Letter of Employment
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mt-0.5">
                    {offerForm.role}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Apex Technologies India • {offerForm.department}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-teal-500/10 text-teal-600 font-bold px-2.5 py-1 rounded-full text-xs border border-teal-500/20">
                    Band {offerForm.band}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface-2)] p-4 rounded-xl">
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] block">Total Fixed CTC:</span>
                  <span className="text-base font-mono font-bold text-[var(--color-text)]">
                    {offerForm.annualCTC}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] block">Joining Bonus:</span>
                  <span className="text-base font-mono font-bold text-teal-600 dark:text-teal-400">
                    {offerForm.joiningBonus}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted)] block">Equity Grant:</span>
                  <span className="text-base font-mono font-bold text-[var(--color-text)]">
                    {offerForm.equityGrant}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                <div>
                  <span className="font-semibold text-[var(--color-text)]">Proposed Start Date:</span>{' '}
                  {offerForm.joiningDate}
                </div>
                <div>
                  <span className="font-semibold text-[var(--color-text)]">Reporting To:</span>{' '}
                  {offerForm.reportingManager}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
              <Button variant="ghost" onClick={() => setCreateStep(1)}>
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleCreateOffer}
                >
                  Create & Submit Offer
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
