import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  MoreHorizontal,
  FileCheck,
  Send,
  CalendarPlus,
  UserCog,
  Ban,
  AlertTriangle,
  Eye,
  Plus,
} from 'lucide-react';
import { AssessmentType } from '@/types';
import { AssessmentFlatRow } from '../hooks';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ASSESSMENT_TABS } from '../assessment.constants';

interface AssessmentTableProps {
  activeTab: AssessmentType;
  data: AssessmentFlatRow[];
  isLoading?: boolean;
  onRowClick: (row: AssessmentFlatRow) => void;
  onEvaluate: (row: AssessmentFlatRow) => void;
  onViewReport: (row: AssessmentFlatRow) => void;
  onExtendDueDate: (row: AssessmentFlatRow) => void;
  onSendReminder: (row: AssessmentFlatRow) => void;
  onReassignEvaluator: (row: AssessmentFlatRow) => void;
  onExpireAssessment: (row: AssessmentFlatRow) => void;
  onBulkReminder: (selected: AssessmentFlatRow[]) => void;
  onBulkExtend: (selected: AssessmentFlatRow[]) => void;
  onAssignNew: () => void;
}

export const AssessmentTable: React.FC<AssessmentTableProps> = ({
  activeTab,
  data,
  isLoading = false,
  onRowClick,
  onEvaluate,
  onViewReport,
  onExtendDueDate,
  onSendReminder,
  onReassignEvaluator,
  onExpireAssessment,
  onBulkReminder,
  onBulkExtend,
  onAssignNew,
}) => {
  const tabConfig = useMemo(
    () => ASSESSMENT_TABS.find((t) => t.id === activeTab) ?? ASSESSMENT_TABS[0]!,
    [activeTab]
  );

  // Common Candidate Column
  const candidateColumn: ColumnDef<AssessmentFlatRow> = useMemo(
    () => ({
      id: 'candidate',
      header: 'Candidate',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800 shrink-0">
              {item.candidateAvatar}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 hover:text-teal-600 block truncate">
                {item.candidateName}
              </span>
              <span className="text-[11px] text-slate-400 block truncate font-mono">
                {item.candidateEmail}
              </span>
            </div>
          </div>
        );
      },
    }),
    []
  );

  // Common Due Date Column with Overdue Danger Chip
  const dueDateColumn: ColumnDef<AssessmentFlatRow> = useMemo(
    () => ({
      id: 'dueAt',
      header: 'Due Date',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5 text-xs text-left">
            <span
              className={`font-mono ${
                item.isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.dueAt}
            </span>
            {item.isOverdue && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase tracking-wider inline-flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Overdue
              </span>
            )}
          </div>
        );
      },
    }),
    []
  );

  // Common Status Column
  const statusColumn: ColumnDef<AssessmentFlatRow> = useMemo(
    () => ({
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status} size="sm" />,
    }),
    []
  );

  // Common Assigned Date Column
  const assignedColumn: ColumnDef<AssessmentFlatRow> = useMemo(
    () => ({
      id: 'assignedAt',
      header: 'Assigned',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500">{row.original.assignedAt}</span>
      ),
    }),
    []
  );

  // Common Actions Column with dropdown
  const actionsColumn: ColumnDef<AssessmentFlatRow> = useMemo(
    () => ({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const item = row.original;
        const isSubmitted = item.status === 'submitted';
        const isEvaluated = item.status === 'evaluated';
        const isExpired = item.status === 'expired';

        return (
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label="Actions menu"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem onClick={() => onRowClick(item)}>
                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onEvaluate(item)}
                  disabled={isExpired}
                  className={isSubmitted ? 'text-teal-600 font-semibold' : ''}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-2 text-teal-600" />
                  {isEvaluated ? 'Re-evaluate' : 'Evaluate'}
                </DropdownMenuItem>

                {item.type === 'psychometric' && (
                  <DropdownMenuItem onClick={() => onViewReport(item)}>
                    <FileText className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                    View Report Preview
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onSendReminder(item)}
                  disabled={isEvaluated || isExpired}
                >
                  <Send className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Send Reminder
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onExtendDueDate(item)}
                  disabled={isExpired}
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Extend Due Date
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onReassignEvaluator(item)}>
                  <UserCog className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Reassign Evaluator
                </DropdownMenuItem>

                {!isExpired && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onExpireAssessment(item)}
                      className="text-rose-600 focus:text-rose-600"
                    >
                      <Ban className="w-3.5 h-3.5 mr-2 text-rose-500" />
                      Expire / Cancel
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
    [
      onRowClick,
      onEvaluate,
      onViewReport,
      onSendReminder,
      onExtendDueDate,
      onReassignEvaluator,
      onExpireAssessment,
    ]
  );

  // Generate Tab-Specific Column Definitions
  const columns: ColumnDef<AssessmentFlatRow>[] = useMemo(() => {
    switch (activeTab) {
      case 'psychometric':
        return [
          candidateColumn,
          {
            id: 'testName',
            header: 'Test Name',
            cell: ({ row }) => (
              <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                {String(row.original.meta.testName || row.original.title)}
              </span>
            ),
          },
          assignedColumn,
          dueDateColumn,
          statusColumn,
          {
            id: 'completion',
            header: 'Completion %',
            cell: ({ row }) => {
              const comp = (row.original.meta.completionPct as number | undefined) ?? (row.original.status === 'evaluated' ? 100 : row.original.status === 'in_progress' ? 65 : 0);
              return (
                <div className="flex items-center gap-2">
                  <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${comp}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {comp}%
                  </span>
                </div>
              );
            },
          },
          {
            id: 'report',
            header: 'Report',
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReport(row.original);
                }}
                className="text-[11px] h-7 px-2.5 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
                <FileText className="w-3 h-3 mr-1" />
                View
              </Button>
            ),
          },
          {
            id: 'band',
            header: 'Result Band',
            cell: ({ row }) => {
              const band = String(row.original.meta.band || (row.original.result === 'pass' ? 'Recommended' : row.original.result === 'review' ? 'Recommended with Reservations' : 'Not Recommended'));
              return (
                <StatusPill
                  status={
                    band === 'Recommended'
                      ? 'pass'
                      : band === 'Recommended with Reservations'
                      ? 'review'
                      : 'fail'
                  }
                  size="sm"
                />
              );
            },
          },
          actionsColumn,
        ];

      case 'language':
        return [
          candidateColumn,
          {
            id: 'language',
            header: 'Language',
            cell: ({ row }) => (
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {String(row.original.meta.language || 'English')}
              </span>
            ),
          },
          {
            id: 'modules',
            header: 'Modules',
            cell: ({ row }) => {
              const mods = (row.original.meta.modules || {}) as Record<string, unknown>;
              return (
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Reading">
                    R:{mods.reading != null ? String(mods.reading) : '-'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Writing">
                    W:{mods.writing != null ? String(mods.writing) : '-'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Listening">
                    L:{mods.listening != null ? String(mods.listening) : '-'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Speaking">
                    S:{mods.speaking != null ? String(mods.speaking) : '-'}
                  </span>
                </div>
              );
            },
          },
          assignedColumn,
          dueDateColumn,
          statusColumn,
          {
            id: 'cefrLevel',
            header: 'CEFR Level',
            cell: ({ row }) => {
              const cefr = String(row.original.meta.cefrLevel || 'B2');
              return (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {cefr}
                </span>
              );
            },
          },
          {
            id: 'score',
            header: 'Overall Score',
            cell: ({ row }) => (
              <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                {row.original.score !== undefined ? `${row.original.score}%` : '—'}
              </span>
            ),
          },
          actionsColumn,
        ];

      case 'performance':
        return [
          candidateColumn,
          {
            id: 'subtype',
            header: 'Assessment Type',
            cell: ({ row }) => (
              <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                {String(row.original.meta.subtype || 'Work Simulation')}
              </span>
            ),
          },
          {
            id: 'evaluator',
            header: 'Evaluator',
            cell: ({ row }) => (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {row.original.evaluatorName || 'Senior Reviewer'}
              </span>
            ),
          },
          assignedColumn,
          dueDateColumn,
          statusColumn,
          {
            id: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
              <StarRating
                value={Number(row.original.meta.rating) || (row.original.score ? Math.round(row.original.score / 20) : 4)}
                readOnly
                size="sm"
              />
            ),
          },
          {
            id: 'recommendation',
            header: 'Recommendation',
            cell: ({ row }) => {
              const rec = String(row.original.meta.recommendation || 'Meets');
              return (
                <StatusPill
                  status={rec === 'Exceeds' ? 'pass' : rec === 'Meets' ? 'review' : 'fail'}
                  size="sm"
                />
              );
            },
          },
          actionsColumn,
        ];

      case 'technical':
        return [
          candidateColumn,
          {
            id: 'track',
            header: 'Track',
            cell: ({ row }) => (
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {String(row.original.meta.track || 'Backend')}
              </span>
            ),
          },
          {
            id: 'format',
            header: 'Format',
            cell: ({ row }) => (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {String(row.original.meta.format || 'Live Coding')}
              </span>
            ),
          },
          {
            id: 'platform',
            header: 'Platform',
            cell: ({ row }) => (
              <span className="text-xs text-slate-500 font-mono">
                {String(row.original.meta.platform || 'CoderPad')}
              </span>
            ),
          },
          assignedColumn,
          dueDateColumn,
          statusColumn,
          {
            id: 'scoreMax',
            header: 'Score/Max',
            cell: ({ row }) => (
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {row.original.score !== undefined
                  ? `${row.original.score}/${row.original.maxScore}`
                  : '—'}
              </span>
            ),
          },
          {
            id: 'percentile',
            header: 'Percentile',
            cell: ({ row }) => (
              <span className="font-mono text-xs text-slate-500">
                {row.original.meta.percentile ? `${String(row.original.meta.percentile)}th` : '85th'}
              </span>
            ),
          },
          {
            id: 'result',
            header: 'Result',
            cell: ({ row }) =>
              row.original.result ? (
                <StatusPill status={row.original.result} size="sm" />
              ) : (
                <span className="text-xs text-slate-400 font-mono">Pending</span>
              ),
          },
          actionsColumn,
        ];

      case 'at':
      default:
        return [
          candidateColumn,
          {
            id: 'assessmentName',
            header: 'Assessment Name',
            cell: ({ row }) => (
              <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                {row.original.title}
              </span>
            ),
          },
          assignedColumn,
          dueDateColumn,
          statusColumn,
          {
            id: 'scoreMax',
            header: 'Score/Max',
            cell: ({ row }) => (
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {row.original.score !== undefined
                  ? `${row.original.score}/${row.original.maxScore}`
                  : '—'}
              </span>
            ),
          },
          {
            id: 'result',
            header: 'Result',
            cell: ({ row }) =>
              row.original.result ? (
                <StatusPill status={row.original.result} size="sm" />
              ) : (
                <span className="text-xs text-slate-400 font-mono">Pending</span>
              ),
          },
          actionsColumn,
        ];
    }
  }, [
    activeTab,
    candidateColumn,
    assignedColumn,
    dueDateColumn,
    statusColumn,
    actionsColumn,
    onViewReport,
  ]);

  // Bulk actions definition for DataTable
  const bulkActions = useMemo(
    () => [
      {
        label: 'Send Reminders',
        icon: Send,
        onClick: (selected: AssessmentFlatRow[]) => onBulkReminder(selected),
      },
      {
        label: 'Extend Due Dates',
        icon: CalendarPlus,
        onClick: (selected: AssessmentFlatRow[]) => onBulkExtend(selected),
      },
    ],
    [onBulkReminder, onBulkExtend]
  );

  if (!isLoading && data.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
          <tabConfig.icon className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-base font-bold text-slate-800 dark:text-slate-200">
          No {tabConfig.label} Assigned
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No assessments in this battery match current filters. Schedule tests to benchmark candidate competency.
        </p>
        <Button
          onClick={onAssignNew}
          className="bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs mt-2"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Assign {tabConfig.shortLabel} Assessment
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={onRowClick}
      bulkActions={bulkActions}
      exportFilename={`${activeTab}-assessments.csv`}
      searchPlaceholder={`Search ${tabConfig.shortLabel.toLowerCase()} assessments...`}
    />
  );
};
