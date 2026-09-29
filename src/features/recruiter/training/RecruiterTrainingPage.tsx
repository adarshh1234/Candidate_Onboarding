import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  LayoutGrid,
  List,
  ShieldCheck,
  Calendar,
  ExternalLink,
  BookOpen,
  Award,
  Star,
  Users,
  Sparkles,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import {
  RecruiterCandidate,
  RecruiterTrainingAssignment,
  TrainingBundle,
} from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ReasonDialog } from '@/components/recruiter/ReasonDialog';
import { toast } from '@/components/ui/toast';
import {
  DEFAULT_TRAINING_TAB_ID,
  VALID_TRAINING_TAB_IDS,
  TrainingTabId,
  MOCK_TRAINING_SESSIONS,
  MOCK_COURSE_CATALOG,
  MOCK_TRAINERS,
} from './training.constants';
import { TrainingTabs } from './components/TrainingTabs';

const DISTINCT_MODULES = [
  'Data Privacy & GDPR Fundamentals',
  'Information Security & Phishing Awareness',
  'Code of Conduct & Workplace Harassment (POSH)',
  'Engineering Architecture & Git Standards',
  'Product Strategy & Customer Empathy',
];

export const RecruiterTrainingPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as TrainingTabId | null;

  const activeTab: TrainingTabId = useMemo(() => {
    if (rawTab && VALID_TRAINING_TAB_IDS.includes(rawTab)) {
      return rawTab;
    }
    return DEFAULT_TRAINING_TAB_ID;
  }, [rawTab]);

  const handleTabChange = (newTab: TrainingTabId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newTab === DEFAULT_TRAINING_TAB_ID) {
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
  const assignTrainingBundle = useHiringStore((state) => state.assignTrainingBundle);
  const waiveTraining = useHiringStore((state) => state.waiveTraining);

  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('table');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  // Assign Bundle Dialog state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<TrainingBundle>('Compliance');
  const [bundleDueDate, setBundleDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Schedule Session Dialog State
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTrainer, setNewSessionTrainer] = useState(MOCK_TRAINERS[0]?.name || '');
  const [newSessionDate, setNewSessionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Waive Dialog state
  const [waivingTarget, setWaivingTarget] = useState<{
    candidate: RecruiterCandidate;
    assignment: RecruiterTrainingAssignment;
  } | null>(null);

  // Tab Badge counts
  const tabCounts = useMemo<Record<string, number>>(() => {
    let pendingMaterials = 0;
    candidates.forEach((c) => {
      (c.training || []).forEach((t) => {
        if (!t.isCompleted && !t.isWaived) pendingMaterials++;
      });
    });

    return {
      materials: pendingMaterials,
      sessions: MOCK_TRAINING_SESSIONS.length,
      courses: MOCK_COURSE_CATALOG.length,
      misc: 4,
      trainer: MOCK_TRAINERS.length,
    };
  }, [candidates]);

  // Dynamic KPI Stats calculated based on activeTab
  const stats = useMemo<StatItem[]>(() => {
    let totalAssignments = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let overdueCount = 0;
    const today = new Date().toISOString().slice(0, 10);

    candidates.forEach((c) => {
      (c.training || []).forEach((t) => {
        totalAssignments++;
        if (t.isCompleted || t.isWaived) {
          completedCount++;
        } else if (t.progress > 0) {
          inProgressCount++;
        }
        if (!t.isCompleted && !t.isWaived && t.dueDate < today) {
          overdueCount++;
        }
      });
    });

    const completionRate =
      totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

    switch (activeTab) {
      case 'sessions':
        return [
          {
            id: 'total-sessions',
            label: 'Scheduled Live Sessions',
            value: MOCK_TRAINING_SESSIONS.length,
            subtitle: 'Orientation & Technical inductions',
            icon: Calendar,
          },
          {
            id: 'total-attendees',
            label: 'Trainees Enrolled',
            value: MOCK_TRAINING_SESSIONS.reduce((acc, s) => acc + s.attendeesCount, 0),
            subtitle: 'Confirmed joiner participants',
            icon: Users,
            variant: 'teal',
          },
          {
            id: 'session-capacity',
            label: 'Capacity Utilization',
            value: '72%',
            subtitle: 'Classroom & virtual seats filled',
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'upcoming-this-week',
            label: 'Sessions This Week',
            value: 3,
            subtitle: 'Action required by hosts',
            icon: Clock,
            variant: 'neutral',
          },
        ];

      case 'courses':
        return [
          {
            id: 'active-courses',
            label: 'Curated Courses',
            value: MOCK_COURSE_CATALOG.length,
            subtitle: 'Internal & External certifications',
            icon: GraduationCap,
          },
          {
            id: 'course-enrolments',
            label: 'Active Enrollments',
            value: MOCK_COURSE_CATALOG.reduce((acc, c) => acc + c.enrolledCount, 0),
            subtitle: 'Joiners progressing through tracks',
            icon: BookOpen,
            variant: 'teal',
          },
          {
            id: 'course-completion-rate',
            label: 'Avg Completion Rate',
            value: '89%',
            subtitle: 'Above industry benchmark (75%)',
            icon: Award,
            variant: 'success',
          },
          {
            id: 'avg-rating',
            label: 'Course Satisfaction',
            value: '4.88 ★',
            subtitle: 'Rated by recent cohort grads',
            icon: Star,
            variant: 'success',
          },
        ];

      case 'trainer':
        return [
          {
            id: 'certified-trainers',
            label: 'Certified Faculty & Trainers',
            value: MOCK_TRAINERS.length,
            subtitle: 'Department heads & subject leads',
            icon: GraduationCap,
            variant: 'teal',
          },
          {
            id: 'sessions-delivered',
            label: 'Sessions Delivered',
            value: MOCK_TRAINERS.reduce((acc, t) => acc + t.sessionsConducted, 0),
            subtitle: 'Lifetime induction workshops',
            icon: CheckCircle2,
            variant: 'success',
          },
          {
            id: 'active-mentees',
            label: 'Active Mentee Trainees',
            value: MOCK_TRAINERS.reduce((acc, t) => acc + t.activeTrainees, 0),
            subtitle: 'Under current cohort guidance',
            icon: Users,
          },
          {
            id: 'trainer-rating',
            label: 'Trainer Feedback Score',
            value: '4.93 / 5.0',
            subtitle: 'Exemplary faculty feedback',
            icon: Star,
            variant: 'success',
          },
        ];

      case 'misc':
        return [
          {
            id: 'misc-credits',
            label: 'Sandbox & Lab Vouchers',
            value: 12,
            subtitle: 'AWS, GCP & Sandbox credits active',
            icon: Sparkles,
            variant: 'teal',
          },
          {
            id: 'external-cert-exams',
            label: 'External Exam Sponsorships',
            value: 6,
            subtitle: 'Certified Cloud & Security Exams',
            icon: Award,
          },
          {
            id: 'waived-modules',
            label: 'Approved Waivers',
            value: candidates.reduce(
              (acc, c) => acc + (c.training || []).filter((t) => t.isWaived).length,
              0
            ),
            subtitle: 'Prior experience exemptions',
            icon: ShieldCheck,
            variant: 'neutral',
          },
          {
            id: 'custom-requests',
            label: 'Custom Training Requests',
            value: 2,
            subtitle: 'Pending L&D approval',
            icon: Clock,
            variant: 'neutral',
          },
        ];

      case 'materials':
      default:
        return [
          {
            id: 'overall-completion',
            label: 'Assigned Modules Completion',
            value: `${completionRate}%`,
            subtitle: `${completedCount} of ${totalAssignments} modules finished`,
            icon: GraduationCap,
            variant: completionRate >= 80 ? 'success' : 'teal',
          },
          {
            id: 'in-progress',
            label: 'In Progress Modules',
            value: inProgressCount,
            subtitle: 'Active joiners reviewing content',
            icon: Clock,
            variant: 'teal',
          },
          {
            id: 'overdue-training',
            label: 'Overdue Modules',
            value: overdueCount,
            subtitle: 'Requires compliance escalation',
            icon: AlertTriangle,
            variant: overdueCount > 0 ? 'danger' : 'neutral',
          },
          {
            id: 'compliance-ready',
            label: 'Fully Certified Candidates',
            value: candidates.filter(
              (c) =>
                (c.training || []).length > 0 &&
                (c.training || []).every((t) => t.isCompleted || t.isWaived)
            ).length,
            subtitle: 'All required bundles completed',
            icon: CheckCircle2,
            variant: 'success',
          },
        ];
    }
  }, [candidates, activeTab]);

  // Flattened training rows for table
  const trainingRows = useMemo(() => {
    const list: Array<{
      id: string;
      candidateId: string;
      candidateName: string;
      candidateEmail: string;
      candidateRole: string;
      candidateAvatar: string;
      department: string;
      location: string;
      assignmentId: string;
      moduleId: string;
      title: string;
      bundle: TrainingBundle;
      dueDate: string;
      progress: number;
      isCompleted: boolean;
      isWaived?: boolean;
      candidateRef: RecruiterCandidate;
      assignmentRef: RecruiterTrainingAssignment;
    }> = [];

    candidates.forEach((cand) => {
      (cand.training || []).forEach((t) => {
        list.push({
          id: `${cand.id}-${t.id}`,
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
          location: cand.location,
          assignmentId: t.id,
          moduleId: t.moduleId,
          title: t.title,
          bundle: t.bundle,
          dueDate: t.dueDate,
          progress: t.progress,
          isCompleted: t.isCompleted,
          isWaived: t.isWaived,
          candidateRef: cand,
          assignmentRef: t,
        });
      });
    });

    return list;
  }, [candidates]);

  // Filtered training rows
  const filteredTrainingRows = useMemo(() => {
    return trainingRows.filter((row) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = row.candidateName.toLowerCase().includes(q);
        const matchTitle = row.title.toLowerCase().includes(q);
        const matchBundle = row.bundle.toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchBundle) return false;
      }
      if (filters.status) {
        if (filters.status === 'Completed' && !row.isCompleted && !row.isWaived) return false;
        if (filters.status === 'In Progress' && (row.progress === 0 || row.isCompleted || row.isWaived))
          return false;
        if (filters.status === 'Not Started' && row.progress > 0) return false;
        if (filters.status === 'Overdue') {
          const today = new Date().toISOString().slice(0, 10);
          if (row.isCompleted || row.isWaived || row.dueDate >= today) return false;
        }
      }
      if (filters.department && row.department !== filters.department) return false;
      if (filters.location && row.location !== filters.location) return false;
      return true;
    });
  }, [trainingRows, filters]);

  // Columns for Materials DataTable
  const materialColumns = useMemo<ColumnDef<(typeof trainingRows)[0]>[]>(
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
        id: 'module',
        header: 'Learning Module & Track',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <p className="font-semibold text-xs text-[var(--color-text)]">{item.title}</p>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
                {item.bundle} Track
              </span>
            </div>
          );
        },
      },
      {
        id: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const item = row.original;
          if (item.isWaived) {
            return (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Waived
              </span>
            );
          }
          return (
            <div className="w-28 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                <span>{item.isCompleted ? '100%' : `${item.progress}%`}</span>
                <span>{item.isCompleted ? 'Done' : item.progress > 0 ? 'Reading' : 'Unopened'}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-2)] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.isCompleted
                      ? 'bg-emerald-500'
                      : item.progress > 0
                      ? 'bg-teal-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{ width: `${item.isCompleted ? 100 : item.progress}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'dueDate',
        header: 'Target Due Date',
        cell: ({ row }) => {
          const item = row.original;
          const today = new Date().toISOString().slice(0, 10);
          const isOverdue = !item.isCompleted && !item.isWaived && item.dueDate < today;
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
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          if (item.isCompleted) {
            return (
              <div className="flex justify-end">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                </span>
              </div>
            );
          }
          if (item.isWaived) {
            return (
              <div className="flex justify-end">
                <span className="text-xs text-slate-400 italic">Exempted</span>
              </div>
            );
          }
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px] text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50"
                onClick={() =>
                  toast.success(
                    'Reminder Sent',
                    `Automated Slack & email reminder sent to ${item.candidateName} for ${item.title}.`
                  )
                }
              >
                <Send className="w-3 h-3 mr-1" /> Remind
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] text-amber-600 border-amber-500/30"
                onClick={() =>
                  setWaivingTarget({
                    candidate: item.candidateRef,
                    assignment: item.assignmentRef,
                  })
                }
              >
                Waive
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer]
  );

  const handleBulkAssign = () => {
    if (selectedCandidateIds.length === 0) {
      toast.error('Select at least one candidate.');
      return;
    }
    assignTrainingBundle(selectedCandidateIds, selectedBundle, bundleDueDate);
    toast.success(`Assigned ${selectedBundle} Track to ${selectedCandidateIds.length} candidate(s).`);
    setIsAssignOpen(false);
    setSelectedCandidateIds([]);
  };

  const handleConfirmWaive = (reason: string) => {
    if (!waivingTarget) return;
    waiveTraining(waivingTarget.candidate.id, waivingTarget.assignment.id, reason);
    toast.success(
      `Waived ${waivingTarget.assignment.title} for ${waivingTarget.candidate.name}: "${reason}"`
    );
    setWaivingTarget(null);
  };

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) {
      toast.error('Enter session title');
      return;
    }
    toast.success('Training Session Scheduled', `"${newSessionTitle}" scheduled with ${newSessionTrainer}.`);
    setIsScheduleSessionOpen(false);
    setNewSessionTitle('');
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Training & Onboarding Curriculum"
        subtitle="Manage mandatory compliance training, scheduled live sessions, structured courses, and trainer directories."
        breadcrumb="Training"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'materials' && (
              <div className="flex items-center bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
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
                <button
                  type="button"
                  className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === 'matrix'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                  onClick={() => setViewMode('matrix')}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Matrix
                </button>
              </div>
            )}

            {activeTab === 'sessions' ? (
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5"
                onClick={() => setIsScheduleSessionOpen(true)}
              >
                <Plus className="w-4 h-4" /> Schedule New Session
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs gap-1.5"
                onClick={() => setIsAssignOpen(true)}
              >
                <Plus className="w-4 h-4" /> Assign Training Track
              </Button>
            )}
          </div>
        }
      />

      {/* Exact Pill Tab Bar from Reference */}
      <TrainingTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />

      {/* Dynamic KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Active Tab View */}
      {activeTab === 'sessions' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Scheduled Onboarding Workshops & AMAs ({MOCK_TRAINING_SESSIONS.length})
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              All times displayed in local user timezone (IST)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_TRAINING_SESSIONS.map((sess) => (
              <div
                key={sess.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {sess.category}
                    </span>
                    <h4 className="font-bold text-sm text-[var(--color-text)] pt-1">{sess.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {sess.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[var(--color-border)]">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      Date & Time
                    </p>
                    <p className="font-medium text-[var(--color-text)] mt-0.5">
                      {sess.date} • {sess.duration}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-mono">{sess.time}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      Location / Room
                    </p>
                    <p className="font-medium text-[var(--color-text)] mt-0.5">{sess.location}</p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                      {sess.attendeesCount} / {sess.maxCapacity} Enrolled
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sess.trainerAvatar}
                      alt={sess.trainerName}
                      className="w-8 h-8 rounded-full object-cover border border-teal-500/20"
                    />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">{sess.trainerName}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{sess.trainerRole}</p>
                    </div>
                  </div>

                  {sess.meetingLink && (
                    <Button
                      size="sm"
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-7"
                      onClick={() =>
                        toast.info(
                          'Launching Meeting',
                          `Redirecting to Google Meet room for "${sess.title}".`
                        )
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Join Session
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'courses' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Curriculum Course Catalog & Certification Pathways
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              Accredited courses assigned to joiners
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_COURSE_CATALOG.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)]">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        {course.provider}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[var(--color-text)]">{course.title}</h4>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    {course.level}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    Syllabus Topics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {course.syllabus.map((syl) => (
                      <span
                        key={syl}
                        className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)]"
                      >
                        {syl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)] text-xs">
                  <div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Duration</p>
                    <p className="font-bold text-[var(--color-text)]">{course.durationHours} Hours</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Enrolled</p>
                    <p className="font-bold text-[var(--color-text)]">{course.enrolledCount} Joiners</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Pass Rate</p>
                    <p className="font-bold text-emerald-600">{course.completionRate}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {course.rating} Rating
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs hover:border-teal-500 hover:text-teal-600"
                    onClick={() =>
                      toast.success(
                        'Course Enrolled',
                        `Enrolled candidate cohort in ${course.title}.`
                      )
                    }
                  >
                    Enroll Cohort
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'trainer' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Faculty & Onboarding Trainers Directory ({MOCK_TRAINERS.length})
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              Certified instructors leading new hire workshops
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_TRAINERS.map((trn) => (
              <div
                key={trn.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={trn.avatar}
                    alt={trn.name}
                    className="w-12 h-12 rounded-full object-cover border border-teal-500/20"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[var(--color-text)] truncate">{trn.name}</h4>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate">
                      {trn.role}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{trn.department}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    Instruction Specialty
                  </p>
                  <p className="text-xs font-semibold text-[var(--color-text)]">{trn.specialty}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[var(--color-border)]">
                  <div className="p-2 rounded bg-[var(--color-surface-2)]">
                    <p className="text-[10px] text-[var(--color-text-muted)]">Workshops Held</p>
                    <p className="font-bold text-sm text-[var(--color-text)] mt-0.5">
                      {trn.sessionsConducted}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-[var(--color-surface-2)]">
                    <p className="text-[10px] text-[var(--color-text-muted)]">Rating</p>
                    <p className="font-bold text-sm text-emerald-600 mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {trn.averageRating}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-teal-600 font-semibold">
                    {trn.activeTrainees} Active Mentees
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs hover:text-teal-600"
                    onClick={() =>
                      toast.info('Contact Trainer', `Email draft opened for ${trn.email}`)
                    }
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'misc' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Supplementary Training Credits, Sandbox Sandpits & Waivers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                <Sparkles className="w-4 h-4" /> Cloud Sandbox & Developer Lab Credits
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Provide $500 monthly AWS / GCP sandbox credit vouchers to engineering candidates for local training and sandbox experimentation.
              </p>
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs"
                onClick={() => toast.success('Sandbox Voucher Granted', 'Sent $500 AWS credit voucher.')}
              >
                Issue Sandbox Voucher
              </Button>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Award className="w-4 h-4" /> External Certification Exam Sponsorship
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Sponsor external certifications (AWS Solutions Architect, CKA, Scrum Master) for candidates passing initial onboarding benchmarks.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-xs hover:border-indigo-500 hover:text-indigo-600"
                onClick={() => toast.success('Exam Code Generated', 'Sponsorship exam voucher generated.')}
              >
                Generate Exam Voucher
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-3">
              All Training Assignments & Waivers
            </h4>
            <DataTable data={filteredTrainingRows} columns={materialColumns} searchKey="candidate" />
          </div>
        </div>
      ) : (
        /* Default: Learning Materials Assigned */
        <div className="space-y-6">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            statusOptions={[
              { label: 'Completed', value: 'Completed' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Not Started', value: 'Not Started' },
              { label: 'Overdue', value: 'Overdue' },
            ]}
            searchPlaceholder="Search candidate, training module, track..."
          />

          {viewMode === 'table' ? (
            <DataTable data={filteredTrainingRows} columns={materialColumns} searchKey="candidate" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-b border-[var(--color-border)] font-semibold">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Department</th>
                    {DISTINCT_MODULES.map((mod) => (
                      <th key={mod} className="p-3 max-w-[140px] truncate" title={mod}>
                        {mod.split('&')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                      <td
                        className="p-3 font-semibold text-[var(--color-text)] cursor-pointer hover:text-teal-600"
                        onClick={() => onOpenCandidateDrawer(c)}
                      >
                        {c.name}
                      </td>
                      <td className="p-3 text-[var(--color-text-muted)]">{c.department}</td>
                      {DISTINCT_MODULES.map((mod) => {
                        const assignment = (c.training || []).find((t) => t.title.includes(mod.slice(0, 10)));
                        if (!assignment) {
                          return <td key={mod} className="p-3 text-slate-300 dark:text-slate-700">—</td>;
                        }
                        if (assignment.isWaived) {
                          return (
                            <td key={mod} className="p-3">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                Waived
                              </span>
                            </td>
                          );
                        }
                        if (assignment.isCompleted) {
                          return (
                            <td key={mod} className="p-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={mod} className="p-3 font-mono font-bold text-teal-600">
                            {assignment.progress}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assign Bundle Dialog */}
      <Dialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        maxWidth="md"
        title="Assign Training Curriculum Track"
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Training Track Bundle
              </label>
              <Select
                value={selectedBundle}
                onChange={(e) => setSelectedBundle(e.target.value as TrainingBundle)}
                className="w-full text-xs"
              >
                <option value="Compliance">Compliance & POSH</option>
                <option value="General">General Orientation</option>
                <option value="Engineering">Engineering Standards</option>
                <option value="Product">Product & Design</option>
                <option value="Sales">Sales Enablement</option>
                <option value="Leadership">Executive Leadership</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Completion Target Due Date
              </label>
              <Input
                type="date"
                value={bundleDueDate}
                onChange={(e) => setBundleDueDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Select Enrolling Candidates ({selectedCandidateIds.length} selected)
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto border border-[var(--color-border)] rounded-lg p-2">
              {candidates.map((cand) => (
                <label
                  key={cand.id}
                  className="flex items-center gap-3 p-1.5 hover:bg-[var(--color-surface-2)] rounded cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.includes(cand.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidateIds((prev) => [...prev, cand.id]);
                      } else {
                        setSelectedCandidateIds((prev) => prev.filter((id) => id !== cand.id));
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
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-700 hover:bg-teal-800 text-white"
              onClick={handleBulkAssign}
            >
              Assign to {selectedCandidateIds.length} Candidate(s)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Schedule Live Session Dialog */}
      <Dialog
        isOpen={isScheduleSessionOpen}
        onClose={() => setIsScheduleSessionOpen(false)}
        maxWidth="md"
        title="Schedule New Training Session"
      >
        <form onSubmit={handleScheduleSession} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Session Title *
            </label>
            <Input
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. Architecture Deep-Dive & Observability"
              className="w-full text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Faculty Trainer *
              </label>
              <Select
                value={newSessionTrainer}
                onChange={(e) => setNewSessionTrainer(e.target.value)}
                className="w-full text-xs"
              >
                {MOCK_TRAINERS.map((trn) => (
                  <option key={trn.id} value={trn.name}>
                    {trn.name} ({trn.role})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Session Date *
              </label>
              <Input
                type="date"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                className="w-full text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsScheduleSessionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
              Schedule Workshop
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Waive Reason Dialog */}
      {waivingTarget && (
        <ReasonDialog
          isOpen={Boolean(waivingTarget)}
          onClose={() => setWaivingTarget(null)}
          title={`Waive Module: ${waivingTarget.assignment.title}`}
          description={`Provide a business justification for exempting ${waivingTarget.candidate.name} from this training requirement.`}
          confirmLabel="Waive Training Requirement"
          presets={[
            'Prior industry experience & equivalent certifications held',
            'Waived by Department VP / Head of Function',
            'Covered under existing university curriculum accreditation',
            'Lateral transfer with prior compliance completion',
          ]}
          onConfirm={handleConfirmWaive}
        />
      )}
    </div>
  );
};
