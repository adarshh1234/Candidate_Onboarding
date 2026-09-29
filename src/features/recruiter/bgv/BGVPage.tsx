import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Play,
  Upload,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, BGVCheck } from '@/types';
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
import { ConfirmDialog } from '@/components/recruiter/ConfirmDialog';
import { BGV_VENDORS } from '@/lib/constants';

export const BGVPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const candidates = useHiringStore((state) => state.candidates);
  const initiateBGV = useHiringStore((state) => state.initiateBGV);
  const updateBGVCheck = useHiringStore((state) => state.updateBGVCheck);
  const escalateBGV = useHiringStore((state) => state.escalateBGV);
  const closeBGVCase = useHiringStore((state) => state.closeBGVCase);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');

  // Selected candidate for Case Detail Sheet/Dialog
  const [activeCaseCandidate, setActiveCaseCandidate] = useState<RecruiterCandidate | null>(null);

  // Initiate Modal state
  const [initiateTarget, setInitiateTarget] = useState<RecruiterCandidate | null>(null);
  const [bulkInitiateIds, setBulkInitiateIds] = useState<string[]>([]);
  const [isBulkInitiateOpen, setIsBulkInitiateOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>(BGV_VENDORS[0]);

  // Edit Check Modal state
  const [editingCheck, setEditingCheck] = useState<{
    candidate: RecruiterCandidate;
    check: BGVCheck;
  } | null>(null);
  const [checkStatus, setCheckStatus] = useState<BGVCheck['status']>('Clear');
  const [checkRemarks, setCheckRemarks] = useState('');

  // Confirm close modal
  const [closingCase, setClosingCase] = useState<{
    candidate: RecruiterCandidate;
    status: 'Clear' | 'Failed';
  } | null>(null);

  // Sync active case candidate from store
  const currentCaseCandidate = useMemo(() => {
    if (!activeCaseCandidate) return null;
    return candidates.find((c) => c.id === activeCaseCandidate.id) || null;
  }, [candidates, activeCaseCandidate]);

  // Stat card counts
  const stats = useMemo<StatItem[]>(() => {
    const total = candidates.length;
    const inProgress = candidates.filter((c) => c.bgv?.status === 'In Progress').length;
    const clear = candidates.filter((c) => c.bgv?.status === 'Clear').length;
    const discrepancy = candidates.filter((c) => c.bgv?.status === 'Discrepancy' || c.bgv?.escalated).length;
    const today = new Date().toISOString().slice(0, 10);
    const overdue = candidates.filter(
      (c) => c.bgv?.status === 'In Progress' && c.bgv?.tatDueDate && c.bgv.tatDueDate < today
    ).length;

    return [
      {
        id: 'total',
        label: 'Total Cases',
        value: total,
        subtitle: 'All background files',
        icon: ShieldCheck,
      },
      {
        id: 'in-progress',
        label: 'In Verification',
        value: inProgress,
        subtitle: 'With external vendors',
        icon: Clock,
        variant: 'teal',
      },
      {
        id: 'clear',
        label: 'Cleared Checks',
        value: clear,
        subtitle: `${Math.round((clear / (total || 1)) * 100)}% clearance rate`,
        icon: CheckCircle2,
        variant: 'success',
      },
      {
        id: 'at-risk',
        label: 'Discrepancy / Overdue',
        value: discrepancy + overdue,
        subtitle: `${overdue} overdue TAT`,
        icon: ShieldAlert,
        variant: 'danger',
      },
    ];
  }, [candidates]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchName = cand.name.toLowerCase().includes(query);
        const matchEmail = cand.email.toLowerCase().includes(query);
        const matchId = (cand.candidateId || cand.candidateCode || cand.id || '').toLowerCase().includes(query);
        const matchVendor = (cand.bgv?.vendor || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchId && !matchVendor) return false;
      }
      if (filters.status && cand.bgv?.status !== filters.status) return false;
      if (filters.department && cand.department !== filters.department) return false;
      if (selectedVendorFilter && cand.bgv?.vendor !== selectedVendorFilter) return false;
      return true;
    });
  }, [candidates, filters, selectedVendorFilter]);

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
              <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5 truncate">
                  {cand.name}
                  {cand.bgv?.escalated && (
                    <span className="inline-flex items-center text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      <Flame className="w-2.5 h-2.5 mr-0.5" /> Escalated
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{cand.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'candidateId',
        header: 'Candidate ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {row.original.candidateId}
          </span>
        ),
      },
      {
        id: 'vendor',
        header: 'Verification Vendor',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text)] font-medium">
            {row.original.bgv?.vendor || (
              <span className="text-[var(--color-text-muted)] italic">Unassigned</span>
            )}
          </span>
        ),
      },
      {
        id: 'initiatedDate',
        header: 'Initiated On',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text-muted)]">
            {row.original.bgv?.initiatedDate || '—'}
          </span>
        ),
      },
      {
        id: 'tatDueDate',
        header: 'TAT Due Date',
        cell: ({ row }) => {
          const bgv = row.original.bgv;
          if (!bgv?.tatDueDate) return <span className="text-xs text-[var(--color-text-muted)]">—</span>;
          const today = new Date().toISOString().slice(0, 10);
          const isOverdue = bgv.status === 'In Progress' && bgv.tatDueDate < today;
          return (
            <span
              className={`text-xs font-medium inline-flex items-center gap-1 ${
                isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
              {bgv.tatDueDate}
              {isOverdue && ' (Overdue)'}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Overall Status',
        cell: ({ row }) => {
          const status = row.original.bgv?.status || 'Not Initiated';
          return <StatusPill status={status} />;
        },
      },
      {
        id: 'checksSummary',
        header: 'Checks Progress',
        cell: ({ row }) => {
          const checks = row.original.bgv?.checks || [];
          const clearCount = checks.filter((c) => c.status === 'Clear').length;
          const totalChecks = checks.length;
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 bg-[var(--color-surface-2)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${totalChecks > 0 ? (clearCount / totalChecks) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">
                {clearCount}/{totalChecks}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cand = row.original;
          const isNotInitiated = !cand.bgv || cand.bgv.status === 'Not Initiated';

          return (
            <div className="flex items-center justify-end gap-1.5">
              {isNotInitiated ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/10"
                  onClick={() => setInitiateTarget(cand)}
                >
                  <Play className="w-3 h-3 mr-1" /> Initiate
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs hover:bg-[var(--color-surface-2)]"
                  onClick={() => setActiveCaseCandidate(cand)}
                >
                  View Checks <ChevronRight className="w-3.5 h-3.5 ml-1 text-[var(--color-text-muted)]" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  const handleConfirmInitiate = () => {
    if (!initiateTarget) return;
    initiateBGV(initiateTarget.id, selectedVendor);
    toast.success(`BGV initiated for ${initiateTarget.name} with ${selectedVendor}`);
    setInitiateTarget(null);
  };

  const handleBulkInitiate = (selectedCandidates: RecruiterCandidate[]) => {
    const ids = selectedCandidates.map((c) => c.id);
    setBulkInitiateIds(ids);
    setIsBulkInitiateOpen(true);
  };

  const handleConfirmBulkInitiate = () => {
    bulkInitiateIds.forEach((id) => {
      initiateBGV(id, selectedVendor);
    });
    toast.success(`Initiated BGV for ${bulkInitiateIds.length} candidate(s) via ${selectedVendor}`);
    setIsBulkInitiateOpen(false);
    setBulkInitiateIds([]);
  };

  const handleSaveCheckResult = () => {
    if (!editingCheck) return;
    updateBGVCheck(
      editingCheck.candidate.id,
      editingCheck.check.type,
      checkStatus,
      checkRemarks
    );
    toast.success(`Updated ${editingCheck.check.type} check result`);
    setEditingCheck(null);
  };

  const handleEscalate = (cand: RecruiterCandidate) => {
    escalateBGV(cand.id);
    toast.info(`Case for ${cand.name} escalated to HR Risk Team.`);
  };

  const handleConfirmClose = () => {
    if (!closingCase) return;
    closeBGVCase(closingCase.candidate.id, closingCase.status);
    toast.success(`BGV Case for ${closingCase.candidate.name} closed as ${closingCase.status}`);
    setClosingCase(null);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Background Verification"
        subtitle="Track third-party background screenings, verify credential checks, and handle TAT escalations."
        breadcrumb="Background Verification"
        actions={
          <div className="flex items-center gap-2">
            <Select
              className="w-48 text-xs"
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
            >
              <option value="">All Verification Vendors</option>
              {BGV_VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
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
          { label: 'Not Initiated', value: 'Not Initiated' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Clear', value: 'Clear' },
          { label: 'Discrepancy', value: 'Discrepancy' },
          { label: 'Failed', value: 'Failed' },
        ]}
        searchPlaceholder="Search candidate, vendor, ID..."
      />

      {/* Table */}
      <DataTable
        data={filteredCandidates}
        columns={columns}
        searchKey="candidate"
        bulkActions={[
          {
            label: 'Initiate BGV',
            icon: Play,
            onClick: handleBulkInitiate,
          },
        ]}
      />

      {/* Initiate Single Modal */}
      <Dialog
        isOpen={!!initiateTarget}
        onClose={() => setInitiateTarget(null)}
        title={`Initiate BGV: ${initiateTarget?.name}`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select a certified screening partner to run Identity, Education, Employment, Criminal, and Reference checks.
          </p>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Background Screening Vendor
            </label>
            <Select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              {BGV_VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v} (Standard 7-Day TAT)
                </option>
              ))}
            </Select>
          </div>
          <div className="bg-[var(--color-surface-2)] p-3 rounded-lg text-xs space-y-1 text-[var(--color-text-muted)]">
            <p className="font-semibold text-[var(--color-text)]">Checks Included in Package:</p>
            <p>• PAN & Aadhaar Government ID Verification</p>
            <p>• Permanent & Current Address Verification</p>
            <p>• Highest Degree Verification via National Academic Depository</p>
            <p>• Past 2 Employers Work History & PF Match</p>
            <p>• Criminal Court Record Search (eCourts database)</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setInitiateTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleConfirmInitiate}
            >
              Confirm & Dispatch
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Bulk Initiate Modal */}
      <Dialog
        isOpen={isBulkInitiateOpen}
        onClose={() => setIsBulkInitiateOpen(false)}
        title={`Bulk Initiate BGV (${bulkInitiateIds.length} Candidates)`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[var(--color-text-muted)]">
            You have selected {bulkInitiateIds.length} candidates. All will be assigned standard checks under the chosen vendor.
          </p>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Screening Vendor
            </label>
            <Select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              {BGV_VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsBulkInitiateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleConfirmBulkInitiate}
            >
              Initiate All
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Case Detail Dialog (View Checks & Action) */}
      <Dialog
        isOpen={!!currentCaseCandidate}
        onClose={() => setActiveCaseCandidate(null)}
        title={`BGV Case Detail — ${currentCaseCandidate?.name}`}
        size="lg"
      >
        {currentCaseCandidate && (
          <div className="space-y-6 pt-2">
            {/* Header info bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--color-surface-2)] p-3 rounded-lg text-xs">
              <div>
                <span className="text-[var(--color-text-muted)] block">Vendor:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {currentCaseCandidate.bgv?.vendor || 'None'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">TAT Deadline:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {currentCaseCandidate.bgv?.tatDueDate || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Status:</span>
                <StatusPill status={currentCaseCandidate.bgv?.status || 'Not Initiated'} />
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Escalation:</span>
                {currentCaseCandidate.bgv?.escalated ? (
                  <span className="font-semibold text-red-600">Escalated</span>
                ) : (
                  <span className="text-[var(--color-text-muted)]">Normal</span>
                )}
              </div>
            </div>

            {/* Checks list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Verification Components
                </h4>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Click any check to update status or record remarks
                </span>
              </div>
              <div className="space-y-2">
                {currentCaseCandidate.bgv?.checks.map((check) => (
                  <div
                    key={check.type}
                    className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-teal-500/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--color-text)]">
                          {check.type}
                        </span>
                        <StatusPill status={check.status} />
                      </div>
                      {check.remarks ? (
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">
                          "{check.remarks}"
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          Verified Date: {check.verifiedDate || 'Pending'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEditingCheck({
                            candidate: currentCaseCandidate,
                            check,
                          });
                          setCheckStatus(check.status);
                          setCheckRemarks(check.remarks || '');
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-[var(--color-text-muted)]"
                        onClick={() => {
                          toast.info(`Mock report downloaded for ${check.type}`);
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" /> Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions at bottom */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--color-border)]">
              <div>
                {!currentCaseCandidate.bgv?.escalated && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10 text-xs"
                    onClick={() => handleEscalate(currentCaseCandidate)}
                  >
                    <Flame className="w-3.5 h-3.5 mr-1" /> Escalate TAT / Issue
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-500/30 hover:bg-red-500/10 text-xs"
                  onClick={() =>
                    setClosingCase({ candidate: currentCaseCandidate, status: 'Failed' })
                  }
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Close as Failed
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  onClick={() =>
                    setClosingCase({ candidate: currentCaseCandidate, status: 'Clear' })
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Close as Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Check Result Dialog */}
      <Dialog
        isOpen={!!editingCheck}
        onClose={() => setEditingCheck(null)}
        title={`Update ${editingCheck?.check.type} Check`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Verification Result
            </label>
            <Select
              value={checkStatus}
              onChange={(e) => setCheckStatus(e.target.value as BGVCheck['status'])}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Clear">Clear</option>
              <option value="Discrepancy">Discrepancy</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Remarks & Observations
            </label>
            <Input
              value={checkRemarks}
              onChange={(e) => setCheckRemarks(e.target.value)}
              placeholder="e.g. Cleared via NAD verification; employment tenure matched PF."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditingCheck(null)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleSaveCheckResult}
            >
              Save Result
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Confirm Close Case Dialog */}
      <ConfirmDialog
        isOpen={!!closingCase}
        onClose={() => setClosingCase(null)}
        onConfirm={handleConfirmClose}
        title={`Close BGV Case as "${closingCase?.status}"?`}
        description={`This will set the candidate's BGV status to ${closingCase?.status} and update the overall onboarding progress accordingly.`}
        confirmText="Confirm & Close"
        variant={closingCase?.status === 'Failed' ? 'danger' : 'primary'}
      />
    </div>
  );
};
