import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  Plus,
  LayoutGrid,
  List,
  PackageCheck,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import {
  RecruiterCandidate,
  ProvisionItem,
  ProvisionStatus,
  ProvisionCategory,
  ProvisionItemType,
} from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import {
  PROVISION_TABS,
  DEFAULT_PROVISION_TAB_ID,
  VALID_PROVISION_TAB_IDS,
  ProvisionTabId,
  ProvisionTabConfig,
} from './provisions.constants';
import { ProvisionTabs } from './components/ProvisionTabs';
import { AssignAssetDialog } from './components/AssignAssetDialog';

export interface FlatProvisionRow {
  id: string; // unique composite
  provisionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  candidateAvatar: string;
  department: string;
  startDate: string;
  item: ProvisionItemType;
  category: ProvisionCategory;
  status: ProvisionStatus;
  dueDate: string;
  assignedTo: string;
  blocked?: boolean;
  blockReason?: string;
  candidateRef: RecruiterCandidate;
  provisionRef: ProvisionItem;
}

const BOARD_COLUMNS: { id: ProvisionStatus; label: string; color: string }[] = [
  { id: 'Requested', label: 'Requested', color: 'border-slate-500/30' },
  { id: 'In Progress', label: 'In Progress', color: 'border-amber-500/30' },
  { id: 'Ready', label: 'Ready for Handover', color: 'border-teal-500/30' },
  { id: 'Delivered', label: 'Delivered / Deployed', color: 'border-emerald-500/30' },
];

export const ProvisionsPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as ProvisionTabId | null;

  const activeTab: ProvisionTabId = useMemo(() => {
    if (rawTab && VALID_PROVISION_TAB_IDS.includes(rawTab)) {
      return rawTab;
    }
    return DEFAULT_PROVISION_TAB_ID;
  }, [rawTab]);

  const handleTabChange = (newTab: ProvisionTabId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === DEFAULT_PROVISION_TAB_ID) {
          next.delete('tab');
        } else {
          next.set('tab', newTab);
        }
        return next;
      },
      { replace: true }
    );
  };

  const fallbackTab = PROVISION_TABS[0] as ProvisionTabConfig;
  const activeTabConfig: ProvisionTabConfig = useMemo(
    () => PROVISION_TABS.find((t) => t.id === activeTab) ?? fallbackTab,
    [activeTab, fallbackTab]
  );

  const candidates = useHiringStore((state) => state.candidates);
  const updateProvisionStatus = useHiringStore((state) => state.updateProvisionStatus);
  const toggleProvisionBlock = useHiringStore((state) => state.toggleProvisionBlock);
  const provisionStandardKit = useHiringStore((state) => state.provisionStandardKit);

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Assign Custom Asset Modal
  const [isAssignAssetOpen, setIsAssignAssetOpen] = useState(false);

  // Bulk Standard Kit Modal
  const [isBulkKitOpen, setIsBulkKitOpen] = useState(false);
  const [selectedKitCandidateIds, setSelectedKitCandidateIds] = useState<string[]>([]);

  // Blocker Dialog State
  const [blockTarget, setBlockTarget] = useState<FlatProvisionRow | null>(null);
  const [blockReason, setBlockReason] = useState('Hardware out of stock / delivery delay');

  // Flatten candidate provisions
  const allProvisions = useMemo<FlatProvisionRow[]>(() => {
    const list: FlatProvisionRow[] = [];
    candidates.forEach((cand) => {
      (cand.provisions || []).forEach((prov) => {
        list.push({
          id: `${cand.id}-${prov.id}`,
          provisionId: prov.id,
          candidateId: cand.id,
          candidateName: cand.name,
          candidateEmail: cand.email,
          candidateRole: cand.role,
          candidateAvatar: cand.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2),
          department: cand.department,
          startDate: cand.startDate,
          item: prov.item,
          category: prov.category,
          status: prov.status,
          dueDate: prov.dueDate,
          assignedTo: prov.assignedTo,
          blocked: prov.blocked,
          blockReason: prov.blockReason,
          candidateRef: cand,
          provisionRef: prov,
        });
      });
    });
    return list;
  }, [candidates]);

  // Tab matcher function
  const matchesTab = (item: FlatProvisionRow, tabId: ProvisionTabId): boolean => {
    if (tabId === 'assets_assignments') return true;
    const tabCfg = PROVISION_TABS.find((t) => t.id === tabId);
    if (!tabCfg) return true;

    // Check category match
    if (tabCfg.category && tabCfg.category !== 'All' && item.category === tabCfg.category) {
      return true;
    }

    // Check keyword match in item name or category
    const itemLower = item.item.toLowerCase();
    const catLower = item.category.toLowerCase();
    return tabCfg.keywords.some((kw) => itemLower.includes(kw) || catLower.includes(kw));
  };

  // Tab counts for badges
  const tabPendingCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      assets_assignments: 0,
      it_assets: 0,
      office_furniture: 0,
      stationary: 0,
      car: 0,
      home: 0,
      misc_assets: 0,
    };

    allProvisions.forEach((prov) => {
      if (prov.status !== 'Delivered') {
        counts.assets_assignments = (counts.assets_assignments || 0) + 1;
        PROVISION_TABS.forEach((tab) => {
          if (tab.id !== 'assets_assignments' && matchesTab(prov, tab.id)) {
            counts[tab.id] = (counts[tab.id] || 0) + 1;
          }
        });
      }
    });

    return counts;
  }, [allProvisions]);

  // Tab-scoped provisions
  const tabProvisions = useMemo(() => {
    return allProvisions.filter((item) => matchesTab(item, activeTab));
  }, [allProvisions, activeTab]);

  // Filtered provisions inside the active tab
  const filteredProvisions = useMemo(() => {
    return tabProvisions.filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = item.candidateName.toLowerCase().includes(q);
        const matchItem = item.item.toLowerCase().includes(q);
        const matchAssignee = item.assignedTo.toLowerCase().includes(q);
        const matchRole = item.candidateRole.toLowerCase().includes(q);
        if (!matchName && !matchItem && !matchAssignee && !matchRole) return false;
      }
      if (filters.status && item.status !== filters.status) return false;
      if (filters.department && item.department !== filters.department) return false;
      return true;
    });
  }, [tabProvisions, filters]);

  // Stat summary cards calculated for the active tab
  const stats = useMemo<StatItem[]>(() => {
    const total = tabProvisions.length;
    const inProgress = tabProvisions.filter((p) => p.status === 'In Progress').length;
    const ready = tabProvisions.filter((p) => p.status === 'Ready' || p.status === 'Delivered').length;
    const blocked = tabProvisions.filter((p) => p.blocked).length;

    return [
      {
        id: 'total-provisions',
        label: `Total ${activeTabConfig.shortLabel}`,
        value: total,
        subtitle: activeTabConfig.description,
        icon: activeTabConfig.icon,
      },
      {
        id: 'in-progress',
        label: 'In Procurement / Setup',
        value: inProgress,
        subtitle: 'Assigned to fulfillment team',
        icon: Clock,
        variant: 'teal',
      },
      {
        id: 'ready-delivered',
        label: 'Ready / Handed Over',
        value: ready,
        subtitle: `${total > 0 ? Math.round((ready / total) * 100) : 0}% fulfillment rate`,
        icon: CheckCircle2,
        variant: 'success',
      },
      {
        id: 'blocked',
        label: 'Blocked Requisitions',
        value: blocked,
        subtitle: 'Requires operational escalation',
        icon: AlertOctagon,
        variant: 'danger',
      },
    ];
  }, [tabProvisions, activeTabConfig]);

  const columns = useMemo<ColumnDef<FlatProvisionRow>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(item.candidateRef)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {item.candidateAvatar}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {item.candidateName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {item.candidateRole} • {item.department}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'item',
        header: 'Asset / Provision Item',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <p className="font-semibold text-xs text-[var(--color-text)] flex items-center gap-1.5">
                {item.item}
                {item.blocked && (
                  <span className="text-[10px] bg-red-500/10 text-red-600 font-bold px-1.5 py-0.2 rounded border border-red-500/20">
                    BLOCKED
                  </span>
                )}
              </p>
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                {item.category}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'assignedTo',
        header: 'Owner / Assignee',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text)] font-medium">
            {row.original.assignedTo}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Target SLA',
        cell: ({ row }) => {
          const item = row.original;
          const today = new Date().toISOString().slice(0, 10);
          const isOverdue = item.status !== 'Delivered' && item.dueDate < today;
          return (
            <span
              className={`text-xs font-mono ${
                isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {item.dueDate}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Select
                className="w-32 h-7 text-[11px]"
                value={item.status}
                onChange={(e) => {
                  updateProvisionStatus(
                    item.candidateId,
                    item.provisionId,
                    e.target.value as ProvisionStatus
                  );
                  toast.success(`Updated ${item.item} to ${e.target.value}`);
                }}
              >
                <option value="Requested">Requested</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
              </Select>

              {item.blocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] text-emerald-600 border-emerald-500/30"
                  onClick={() => {
                    toggleProvisionBlock(item.candidateId, item.provisionId, false);
                    toast.success(`Unblocked ${item.item}`);
                  }}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] text-red-600 hover:bg-red-500/10"
                  onClick={() => setBlockTarget(item)}
                >
                  Flag Block
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer, updateProvisionStatus, toggleProvisionBlock]
  );

  const handleBulkKitProvision = () => {
    if (selectedKitCandidateIds.length === 0) {
      toast.error('Select at least one candidate.');
      return;
    }
    selectedKitCandidateIds.forEach((id) => {
      provisionStandardKit(id);
    });
    toast.success(`Provisioned standard equipment kit for ${selectedKitCandidateIds.length} candidate(s).`);
    setIsBulkKitOpen(false);
    setSelectedKitCandidateIds([]);
  };

  const handleConfirmBlock = () => {
    if (!blockTarget) return;
    toggleProvisionBlock(blockTarget.candidateId, blockTarget.provisionId, true, blockReason);
    toast.error(`Flagged ${blockTarget.item} as Blocked: ${blockReason}`);
    setBlockTarget(null);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Provisions & Equipment"
        subtitle="Manage hardware dispatch, office furniture, vehicles, stationary, and remote workplace allocations."
        breadcrumb="Provisions"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsBulkKitOpen(true)}
            >
              <PackageCheck className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Standard Kit
            </Button>

            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5"
              onClick={() => setIsAssignAssetOpen(true)}
            >
              <Plus className="w-4 h-4" /> Requisition {activeTabConfig.shortLabel}
            </Button>
          </div>
        }
      />

      {/* Exact Pill Tab Bar from Reference */}
      <ProvisionTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabPendingCounts}
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        statusOptions={[
          { label: 'Requested', value: 'Requested' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Ready', value: 'Ready' },
          { label: 'Delivered', value: 'Delivered' },
        ]}
        searchPlaceholder={`Search ${activeTabConfig.shortLabel.toLowerCase()} assets, candidates, assignees...`}
      />

      {/* View: Board or Table */}
      {viewMode === 'table' ? (
        <DataTable data={filteredProvisions} columns={columns} searchKey="candidate" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((col) => {
            const columnItems = filteredProvisions.filter((p) => p.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-[var(--color-surface-2)]/60 rounded-xl p-3 border border-[var(--color-border)] flex flex-col min-w-[260px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-semibold bg-[var(--color-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    {columnItems.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {columnItems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--color-text-muted)] italic border border-dashed border-[var(--color-border)] rounded-lg">
                      No items in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    columnItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-[var(--color-surface)] p-3.5 rounded-lg border shadow-xs transition-all space-y-2.5 ${
                          item.blocked
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-[var(--color-border)] hover:border-teal-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-xs text-[var(--color-text)] flex items-center gap-1">
                              {item.item}
                              {item.blocked && (
                                <AlertOctagon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              )}
                            </p>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                            {item.dueDate}
                          </span>
                        </div>

                        {item.blocked && item.blockReason && (
                          <div className="p-1.5 rounded bg-red-500/10 text-red-600 text-[10px] font-medium">
                            Blocked: {item.blockReason}
                          </div>
                        )}

                        <div
                          className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)] cursor-pointer group"
                          onClick={() => onOpenCandidateDrawer(item.candidateRef)}
                        >
                          <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9px] font-bold flex items-center justify-center">
                            {item.candidateAvatar}
                          </div>
                          <span className="text-[11px] font-medium text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                            {item.candidateName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 gap-1">
                          <Select
                            className="h-6 text-[10px] flex-1"
                            value={item.status}
                            onChange={(e) => {
                              updateProvisionStatus(
                                item.candidateId,
                                item.provisionId,
                                e.target.value as ProvisionStatus
                              );
                              toast.success(`Updated ${item.item} to ${e.target.value}`);
                            }}
                          >
                            <option value="Requested">Requested</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                          </Select>

                          {item.blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2 text-emerald-600 border-emerald-500/30"
                              onClick={() => {
                                toggleProvisionBlock(item.candidateId, item.provisionId, false);
                                toast.success(`Unblocked ${item.item}`);
                              }}
                            >
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] px-2 text-red-600 hover:bg-red-500/10"
                              onClick={() => setBlockTarget(item)}
                            >
                              Block
                            </Button>
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

      {/* Assign Asset Modal */}
      <AssignAssetDialog
        isOpen={isAssignAssetOpen}
        onClose={() => setIsAssignAssetOpen(false)}
        activeTab={activeTab}
      />

      {/* Bulk Kit Modal */}
      <Dialog
        isOpen={isBulkKitOpen}
        onClose={() => setIsBulkKitOpen(false)}
        maxWidth="md"
        title="Provision Standard Equipment Kit"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Automatically requisitions standard IT setup (Laptop, Slack/Email, GitHub access, ID badge, and Desk) for selected candidates.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-lg p-2">
            {candidates.map((cand) => (
              <label
                key={cand.id}
                className="flex items-center gap-3 p-2 hover:bg-[var(--color-surface-2)] rounded cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedKitCandidateIds.includes(cand.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKitCandidateIds((prev) => [...prev, cand.id]);
                    } else {
                      setSelectedKitCandidateIds((prev) => prev.filter((id) => id !== cand.id));
                    }
                  }}
                  className="rounded border-[var(--color-border)] text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{cand.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {cand.role} • {cand.department}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsBulkKitOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white"
              onClick={handleBulkKitProvision}
            >
              Provision for {selectedKitCandidateIds.length} Candidate(s)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Blocker Reason Dialog */}
      <Dialog
        isOpen={Boolean(blockTarget)}
        onClose={() => setBlockTarget(null)}
        maxWidth="sm"
        title="Flag Item as Blocked"
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Specify the impediment preventing fulfillment of{' '}
            <strong className="text-[var(--color-text)]">{blockTarget?.item}</strong>:
          </p>

          <Select
            className="w-full text-xs"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          >
            <option value="Hardware out of stock / delivery delay">
              Hardware out of stock / delivery delay
            </option>
            <option value="Security clearance / IAM approval pending">
              Security clearance / IAM approval pending
            </option>
            <option value="Facilities / seat allocation clash">
              Facilities / seat allocation clash
            </option>
            <option value="Awaiting candidate device preference">
              Awaiting candidate device preference
            </option>
            <option value="Vendor procurement hold">Vendor procurement hold</option>
          </Select>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setBlockTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmBlock}
            >
              Confirm Block
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
