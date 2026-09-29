import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHiringStore } from '@/store/hiring.store';
import {
  AssessmentType,
  CandidateAssessment,
  RecruiterCandidate,
  AssessmentStatus,
  AssessmentResult,
} from '@/types';
import {
  VALID_TAB_IDS,
  DEFAULT_TAB_ID,
  ASSESSMENT_TABS,
} from './assessment.constants';
import { StatItem } from '@/components/recruiter/StatCardRow';
import {
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

export interface AssessmentFlatRow {
  id: string; // assessment id
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  department: string;
  role: string;
  title: string;
  type: AssessmentType;
  assignedAt: string;
  dueAt: string;
  status: AssessmentStatus;
  score?: number;
  maxScore: number;
  passMark: number;
  result?: AssessmentResult;
  evaluatorId?: string;
  evaluatorName?: string;
  remarks?: string;
  meta: Record<string, unknown>;
  isOverdue: boolean;
  candidateRef: RecruiterCandidate;
  rawAssessment: CandidateAssessment;
}

export function useAssessmentTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as AssessmentType | null;

  const activeTab: AssessmentType = useMemo(() => {
    if (rawTab && VALID_TAB_IDS.includes(rawTab)) {
      return rawTab;
    }
    return DEFAULT_TAB_ID;
  }, [rawTab]);

  const setActiveTab = useCallback(
    (tabId: AssessmentType) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tabId === DEFAULT_TAB_ID) {
            next.delete('tab');
          } else {
            next.set('tab', tabId);
          }
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  return { activeTab, setActiveTab };
}

export interface AssessmentFilterState {
  search: string;
  status: string;
  department: string;
  dateRange: string;
  overdueOnly: boolean;
}

export function useAssessmentFilters() {
  const [filters, setFilters] = useState<AssessmentFilterState>({
    search: '',
    status: '',
    department: '',
    dateRange: '',
    overdueOnly: false,
  });

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      department: '',
      dateRange: '',
      overdueOnly: false,
    });
  }, []);

  return { filters, setFilters, resetFilters };
}

type AssessmentTrackId = 'psychometric' | 'language' | 'performance' | 'technical' | 'at';
const VALID_TRACK_IDS: ReadonlySet<AssessmentTrackId> = new Set(['psychometric', 'language', 'performance', 'technical', 'at'] as const);

export function useAssessmentData(activeTab: AssessmentType, filters: AssessmentFilterState) {
  const candidates = useHiringStore((state) => state.candidates);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tabPendingCounts = useMemo<Record<AssessmentTrackId, number>>(() => {
    const counts: Record<AssessmentTrackId, number> = {
      psychometric: 0,
      language: 0,
      performance: 0,
      technical: 0,
      at: 0,
    };

    candidates.forEach((cand) => {
      (cand.assessments || []).forEach((asm) => {
        if (
          VALID_TRACK_IDS.has(asm.type as AssessmentTrackId) &&
          (asm.status === 'assigned' || asm.status === 'in_progress' || asm.status === 'submitted')
        ) {
          counts[asm.type as AssessmentTrackId]++;
        }
      });
    });

    return counts;
  }, [candidates]);

  // All flat rows for the currently active tab
  const allTabRows = useMemo<AssessmentFlatRow[]>(() => {
    const rows: AssessmentFlatRow[] = [];

    candidates.forEach((cand) => {
      (cand.assessments || []).forEach((asm) => {
        if (asm.type === activeTab) {
          const effectiveDueAt = asm.dueAt || asm.dueDate || todayStr;
          const isOverdue =
            asm.status !== 'evaluated' &&
            asm.status !== 'expired' &&
            effectiveDueAt < todayStr;

          rows.push({
            id: asm.id,
            candidateId: cand.id,
            candidateName: cand.name,
            candidateEmail: cand.email,
            candidateAvatar: cand.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2),
            department: cand.department,
            role: cand.role,
            title: asm.title,
            type: asm.type,
            assignedAt: asm.assignedAt || asm.assignedDate || todayStr,
            dueAt: asm.dueAt || asm.dueDate || todayStr,
            status: asm.status,
            score: asm.score,
            maxScore: asm.maxScore || 100,
            passMark: asm.passMark || asm.passThreshold || 70,
            result: asm.result,
            evaluatorId: asm.evaluatorId,
            evaluatorName: asm.evaluatorName,
            remarks: asm.remarks || asm.comments,
            meta: asm.meta || {},
            isOverdue,
            candidateRef: cand,
            rawAssessment: asm,
          });
        }
      });
    });

    return rows;
  }, [candidates, activeTab, todayStr]);

  // Filtered rows for active tab
  const filteredRows = useMemo<AssessmentFlatRow[]>(() => {
    return allTabRows.filter((row) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = row.candidateName.toLowerCase().includes(q);
        const matchEmail = row.candidateEmail.toLowerCase().includes(q);
        const matchTitle = row.title.toLowerCase().includes(q);
        const matchEvaluator = (row.evaluatorName || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTitle && !matchEvaluator) return false;
      }

      if (filters.status && row.status !== filters.status) return false;
      if (filters.department && row.department !== filters.department) return false;

      if (filters.overdueOnly && !row.isOverdue) return false;

      if (filters.dateRange) {
        const rowDue = row.dueAt;
        const diffDays = Math.ceil(
          (new Date(rowDue).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24),
        );
        if (filters.dateRange === 'next_7_days' && (diffDays > 7 || diffDays < 0)) return false;
        if (filters.dateRange === 'next_14_days' && (diffDays > 14 || diffDays < 0)) return false;
        if (filters.dateRange === 'overdue' && !row.isOverdue) return false;
      }

      return true;
    });
  }, [allTabRows, filters, todayStr]);

  // Tab Stats (recomputes per active tab)
  const tabStats = useMemo<StatItem[]>(() => {
    const total = allTabRows.length;
    const assignedCount = allTabRows.filter((r) => r.status === 'assigned').length;
    const inProgressCount = allTabRows.filter((r) => r.status === 'in_progress').length;
    const submittedCount = allTabRows.filter((r) => r.status === 'submitted').length;
    const evaluatedRows = allTabRows.filter((r) => r.status === 'evaluated' && r.score !== undefined);

    const avgScore =
      evaluatedRows.length > 0
        ? Math.round(
            evaluatedRows.reduce((acc, curr) => acc + (curr.score || 0), 0) / evaluatedRows.length,
          )
        : 0;

    const passedCount = evaluatedRows.filter((r) => r.result === 'pass').length;
    const passRate = evaluatedRows.length > 0 ? Math.round((passedCount / evaluatedRows.length) * 100) : 0;

    const tabConfig = ASSESSMENT_TABS.find((t) => t.id === activeTab);
    const tabName = tabConfig?.shortLabel || 'Assessment';

    return [
      {
        id: 'assigned',
        label: `${tabName} Assigned`,
        value: assignedCount,
        subtitle: `${total} total in battery`,
        icon: Clock,
        variant: 'default',
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        value: inProgressCount,
        subtitle: 'Candidates currently taking test',
        icon: Clock,
        variant: 'warning',
      },
      {
        id: 'submitted',
        label: 'Submitted / Awaiting Review',
        value: submittedCount,
        subtitle: 'Ready for scoring',
        icon: AlertCircle,
        variant: 'teal',
      },
      {
        id: 'avg-score',
        label: 'Average Score',
        value: evaluatedRows.length > 0 ? `${avgScore}%` : '—',
        subtitle: `${evaluatedRows.length} evaluated submissions`,
        icon: TrendingUp,
        variant: 'neutral',
      },
      {
        id: 'pass-rate',
        label: 'Pass Rate',
        value: evaluatedRows.length > 0 ? `${passRate}%` : '—',
        subtitle: `${passedCount} of ${evaluatedRows.length} passed`,
        icon: Award,
        variant: 'success',
      },
    ];
  }, [allTabRows, activeTab]);

  return {
    allTabRows,
    filteredRows,
    tabPendingCounts,
    tabStats,
  };
}
