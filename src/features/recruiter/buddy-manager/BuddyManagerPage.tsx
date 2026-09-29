import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Shield,
  HeartHandshake,
  UserCheck,
  Building2,
  Mail,
  Users2,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, Employee, BuddyManagerAssignment } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { Button } from '@/components/ui/button';
import { AssignDialog } from '@/components/recruiter/AssignDialog';
import { toast } from '@/components/ui/toast';
import {
  DEFAULT_BUDDY_TAB_ID,
  VALID_BUDDY_TAB_IDS,
  BuddyManagerTabId,
  DEPARTMENT_HEADS_DIRECTORY,
} from './buddyManager.constants';
import { BuddyManagerTabs } from './components/BuddyManagerTabs';

export const BuddyManagerPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as BuddyManagerTabId | null;

  const activeTab: BuddyManagerTabId = useMemo(() => {
    if (rawTab && VALID_BUDDY_TAB_IDS.includes(rawTab)) {
      return rawTab;
    }
    return DEFAULT_BUDDY_TAB_ID;
  }, [rawTab]);

  const handleTabChange = (newTab: BuddyManagerTabId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === DEFAULT_BUDDY_TAB_ID) {
          next.delete('tab');
        } else {
          next.set('tab', newTab);
        }
        return next;
      },
      { replace: true }
    );
  };

  const candidates = useHiringStore((state) => state.candidates);
  const assignBuddyAndManager = useHiringStore((state) => state.assignBuddyAndManager);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Assign Dialog state
  const [activeAssignCandidate, setActiveAssignCandidate] = useState<RecruiterCandidate | null>(null);
  const [assignType, setAssignType] = useState<'manager' | 'buddy'>('buddy');

  // Badge counts for tabs
  const tabCounts = useMemo<Record<string, number>>(() => {
    const unassignedManager = candidates.filter((c) => !c.buddyManager?.managerName).length;
    const unassignedBuddy = candidates.filter((c) => !c.buddyManager?.buddyName).length;
    const unassignedAny = candidates.filter(
      (c) => !c.buddyManager?.managerName || !c.buddyManager?.buddyName
    ).length;

    return {
      department: unassignedAny,
      reporting_to: unassignedManager,
      team_head: unassignedBuddy,
      dept_head: Object.keys(DEPARTMENT_HEADS_DIRECTORY).length,
    };
  }, [candidates]);

  // Tab-specific KPI Stat Cards
  const stats = useMemo<StatItem[]>(() => {
    const total = candidates.length;
    const fullyPaired = candidates.filter(
      (c) => c.buddyManager?.managerName && c.buddyManager?.buddyName
    ).length;
    const missingBuddy = candidates.filter((c) => !c.buddyManager?.buddyName).length;
    const missingManager = candidates.filter((c) => !c.buddyManager?.managerName).length;

    switch (activeTab) {
      case 'reporting_to':
        return [
          {
            id: 'total-reporters',
            label: 'Total Direct Reports',
            value: total,
            subtitle: 'Joiners requiring reporting managers',
            icon: UserCheck,
          },
          {
            id: 'assigned-managers',
            label: 'Assigned Managers',
            value: total - missingManager,
            subtitle: `${total > 0 ? Math.round(((total - missingManager) / total) * 100) : 0}% reporting lines established`,
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'missing-manager',
            label: 'Unassigned Direct Managers',
            value: missingManager,
            subtitle: 'Pending reporting line assignment',
            icon: AlertTriangle,
            variant: missingManager > 0 ? 'danger' : 'neutral',
          },
          {
            id: 'unique-managers',
            label: 'Active People Managers',
            value: new Set(candidates.map((c) => c.buddyManager?.managerName).filter(Boolean)).size,
            subtitle: 'Leadership mentors engaged',
            icon: Shield,
            variant: 'teal',
          },
        ];

      case 'team_head':
        return [
          {
            id: 'total-team-joiners',
            label: 'Squad & Team Joiners',
            value: total,
            subtitle: 'Allocated across functional squads',
            icon: Users2,
          },
          {
            id: 'buddies-assigned',
            label: 'Peer Buddies Assigned',
            value: total - missingBuddy,
            subtitle: `${total > 0 ? Math.round(((total - missingBuddy) / total) * 100) : 0}% peer guide coverage`,
            icon: HeartHandshake,
            variant: 'success',
          },
          {
            id: 'missing-buddy',
            label: 'Pending Peer Buddy',
            value: missingBuddy,
            subtitle: 'Needs 1-on-1 squad buddy',
            icon: AlertTriangle,
            variant: missingBuddy > 0 ? 'teal' : 'neutral',
          },
          {
            id: 'active-squads',
            label: 'Active Squads / Pods',
            value: 12,
            subtitle: 'Engineering, Design & Product squads',
            icon: Layers,
            variant: 'neutral',
          },
        ];

      case 'dept_head':
        return [
          {
            id: 'total-dept-heads',
            label: 'Department Heads In Charge',
            value: Object.keys(DEPARTMENT_HEADS_DIRECTORY).length,
            subtitle: 'Division Executive Leaders & VPs',
            icon: ShieldCheck,
            variant: 'teal',
          },
          {
            id: 'departments-represented',
            label: 'Active Departments',
            value: new Set(candidates.map((c) => c.department)).size,
            subtitle: 'Operational business units',
            icon: Building2,
          },
          {
            id: 'fully-paired',
            label: 'Fully Paired Joiners',
            value: fullyPaired,
            subtitle: `${total > 0 ? Math.round((fullyPaired / total) * 100) : 0}% executive compliance`,
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'executive-escalations',
            label: 'Executive Attention Needed',
            value: missingManager,
            subtitle: 'Missing manager escalation',
            icon: AlertTriangle,
            variant: missingManager > 0 ? 'danger' : 'neutral',
          },
        ];

      case 'department':
      default:
        return [
          {
            id: 'total-candidates',
            label: 'Total Hires',
            value: total,
            subtitle: 'All onboardees needing pairings',
            icon: Users,
          },
          {
            id: 'fully-paired',
            label: 'Fully Assigned Pairs',
            value: fullyPaired,
            subtitle: `${total > 0 ? Math.round((fullyPaired / total) * 100) : 0}% coverage`,
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'missing-buddy',
            label: 'Unassigned Buddy',
            value: missingBuddy,
            subtitle: 'Peer guide missing',
            icon: HeartHandshake,
            variant: missingBuddy > 0 ? 'teal' : 'neutral',
          },
          {
            id: 'missing-manager',
            label: 'Unassigned Direct Manager',
            value: missingManager,
            subtitle: 'Reporting leader missing',
            icon: Shield,
            variant: missingManager > 0 ? 'danger' : 'neutral',
          },
        ];
    }
  }, [candidates, activeTab]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = cand.name.toLowerCase().includes(q);
        const matchRole = cand.role.toLowerCase().includes(q);
        const matchDept = cand.department.toLowerCase().includes(q);
        const matchMgr = (cand.buddyManager?.managerName || '').toLowerCase().includes(q);
        const matchBuddy = (cand.buddyManager?.buddyName || '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchDept && !matchMgr && !matchBuddy) return false;
      }
      if (filters.status) {
        if (filters.status === 'Fully Paired') {
          if (!cand.buddyManager?.managerName || !cand.buddyManager?.buddyName) return false;
        } else if (filters.status === 'Missing Buddy') {
          if (cand.buddyManager?.buddyName) return false;
        } else if (filters.status === 'Missing Manager') {
          if (cand.buddyManager?.managerName) return false;
        }
      }
      if (filters.department && cand.department !== filters.department) return false;
      if (filters.location && cand.location !== filters.location) return false;
      return true;
    });
  }, [candidates, filters]);

  // Columns for standard / Department view
  const defaultColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
                  {cand.role} • {cand.department}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{row.original.startDate}</span>
        ),
      },
      {
        id: 'manager',
        header: 'Direct Manager',
        cell: ({ row }) => {
          const cand = row.original;
          const mgr = cand.buddyManager?.managerName;
          const email = cand.buddyManager?.managerEmail;

          if (!mgr) {
            return (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full hover:bg-red-500/20 transition-colors cursor-pointer"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('manager');
                }}
              >
                <AlertTriangle className="w-3 h-3" /> Unassigned
              </button>
            );
          }

          return (
            <div className="flex items-center justify-between gap-2 max-w-[200px]">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{mgr}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{email}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-1.5 hover:text-teal-600"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('manager');
                }}
              >
                Edit
              </Button>
            </div>
          );
        },
      },
      {
        id: 'buddy',
        header: 'Onboarding Buddy',
        cell: ({ row }) => {
          const cand = row.original;
          const buddy = cand.buddyManager?.buddyName;
          const email = cand.buddyManager?.buddyEmail;

          if (!buddy) {
            return (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('buddy');
                }}
              >
                <AlertTriangle className="w-3 h-3" /> Unassigned
              </button>
            );
          }

          return (
            <div className="flex items-center justify-between gap-2 max-w-[200px]">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{buddy}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{email}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-1.5 hover:text-teal-600"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('buddy');
                }}
              >
                Edit
              </Button>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Pairing Status',
        cell: ({ row }) => {
          const cand = row.original;
          const isComplete = cand.buddyManager?.managerName && cand.buddyManager?.buddyName;
          return isComplete ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs hover:border-teal-500 hover:text-teal-600"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType(cand.buddyManager?.managerName ? 'buddy' : 'manager');
                }}
              >
                Manage Pair
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Columns for "Reporting to" focus
  const reportingToColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Direct Report (Joiner)',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(cand)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {cand.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{cand.role}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            {row.original.department}
          </span>
        ),
      },
      {
        id: 'reportingManager',
        header: 'Reporting To (Direct Manager)',
        cell: ({ row }) => {
          const cand = row.original;
          const mgr = cand.buddyManager?.managerName;
          const role = cand.buddyManager?.managerRole || 'People Leader';
          const email = cand.buddyManager?.managerEmail;

          if (!mgr) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> No Manager Assigned
              </span>
            );
          }

          return (
            <div>
              <p className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                {mgr}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {role} • {email}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Reporting Start Date',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{row.original.startDate}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white h-7 text-xs"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('manager');
                }}
              >
                {cand.buddyManager?.managerName ? 'Change Manager' : 'Assign Manager'}
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  // Columns for "Team & Team Head"
  const teamHeadColumns = useMemo<ColumnDef<RecruiterCandidate>[]>(
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
                {cand.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {cand.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{cand.role}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'teamSquad',
        header: 'Assigned Squad / Functional Pod',
        cell: ({ row }) => {
          const cand = row.original;
          const deptInfo = DEPARTMENT_HEADS_DIRECTORY[cand.department];
          const squad = deptInfo?.activeSquads[0] || 'Core Functional Team';

          return (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                {squad}
              </p>
              <span className="text-[10px] text-[var(--color-text-muted)]">{cand.department}</span>
            </div>
          );
        },
      },
      {
        id: 'buddy',
        header: 'Squad Peer Buddy',
        cell: ({ row }) => {
          const cand = row.original;
          const buddy = cand.buddyManager?.buddyName;
          const email = cand.buddyManager?.buddyEmail;

          if (!buddy) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Unpaired Buddy
              </span>
            );
          }

          return (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                {buddy}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{email}</p>
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
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs hover:border-teal-500 hover:text-teal-600"
                onClick={() => {
                  setActiveAssignCandidate(cand);
                  setAssignType('buddy');
                }}
              >
                {cand.buddyManager?.buddyName ? 'Change Buddy' : 'Assign Buddy'}
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  const handleAssignEmployee = (emp: Employee) => {
    if (!activeAssignCandidate) return;

    const currentAssignment = activeAssignCandidate.buddyManager || {};
    const updated = {
      ...currentAssignment,
      ...(assignType === 'manager'
        ? {
            managerId: emp.id,
            managerName: emp.name,
            managerRole: emp.role,
            managerEmail: emp.email,
          }
        : {
            buddyId: emp.id,
            buddyName: emp.name,
            buddyRole: emp.role,
            buddyEmail: emp.email,
          }),
    };

    assignBuddyAndManager(activeAssignCandidate.id, updated as BuddyManagerAssignment);
    toast.success(
      `Assigned ${emp.name} as ${assignType === 'manager' ? 'Direct Manager' : 'Buddy'} to ${
        activeAssignCandidate.name
      }.`
    );
    setActiveAssignCandidate(null);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Buddy & Direct Manager Hierarchy"
        subtitle="Manage department structures, reporting lines, team squad allocations, and executive department heads in charge."
        breadcrumb="Buddy / Manager"
      />

      {/* Exact Pill Tab Bar from Reference */}
      <BuddyManagerTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        statusOptions={[
          { label: 'Fully Paired', value: 'Fully Paired' },
          { label: 'Missing Buddy', value: 'Missing Buddy' },
          { label: 'Missing Manager', value: 'Missing Manager' },
        ]}
        searchPlaceholder="Search candidate, manager, buddy, or department..."
      />

      {/* View Content Depending on Active Tab */}
      {activeTab === 'dept_head' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DEPARTMENT_HEADS_DIRECTORY).map(([deptName, info]) => {
              const deptCandidates = candidates.filter((c) => c.department === deptName);
              const unassignedCount = deptCandidates.filter(
                (c) => !c.buddyManager?.managerName || !c.buddyManager?.buddyName
              ).length;

              return (
                <div
                  key={deptName}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={info.headAvatar}
                        alt={info.headName}
                        className="w-11 h-11 rounded-full object-cover border border-teal-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[var(--color-text)] truncate">
                          {info.headName}
                        </h4>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate">
                          {info.headTitle}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          {info.headEmail}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                      {deptName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--color-border)]">
                    <div className="p-2 rounded-lg bg-[var(--color-surface-2)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                        Active Joiners
                      </p>
                      <p className="text-base font-bold text-[var(--color-text)]">
                        {deptCandidates.length}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--color-surface-2)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                        Pairing Gaps
                      </p>
                      <p
                        className={`text-base font-bold ${
                          unassignedCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {unassignedCount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      Active Squads ({info.activeSquads.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {info.activeSquads.slice(0, 3).map((squad) => (
                        <span
                          key={squad}
                          className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)]"
                        >
                          {squad}
                        </span>
                      ))}
                      {info.activeSquads.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                          +{info.activeSquads.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Policy: {info.defaultBuddyPolicy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">
              Joiners Under Department Heads
            </h3>
            <DataTable data={filteredCandidates} columns={defaultColumns} searchKey="candidate" />
          </div>
        </div>
      ) : activeTab === 'reporting_to' ? (
        <DataTable data={filteredCandidates} columns={reportingToColumns} searchKey="candidate" />
      ) : activeTab === 'team_head' ? (
        <DataTable data={filteredCandidates} columns={teamHeadColumns} searchKey="candidate" />
      ) : (
        <DataTable data={filteredCandidates} columns={defaultColumns} searchKey="candidate" />
      )}

      {/* Searchable Assign Dialog */}
      {activeAssignCandidate && (
        <AssignDialog
          isOpen={!!activeAssignCandidate}
          onClose={() => setActiveAssignCandidate(null)}
          candidate={activeAssignCandidate}
          assignmentType={assignType}
          onAssign={handleAssignEmployee}
        />
      )}
    </div>
  );
};
