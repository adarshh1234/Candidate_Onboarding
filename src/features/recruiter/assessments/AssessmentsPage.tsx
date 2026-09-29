import React, { useState } from 'react';
import { Plus, Search, X, AlertTriangle } from 'lucide-react';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow } from '@/components/recruiter/StatCardRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { RECRUITER_DEPARTMENTS } from '@/lib/constants';
import { useHiringStore } from '@/store/hiring.store';
import { AssessmentFlatRow, useAssessmentTab, useAssessmentFilters, useAssessmentData } from './hooks';
import { ASSESSMENT_TABS, EVALUATOR_EMPLOYEES } from './assessment.constants';
import { AssessmentTabs } from './components/AssessmentTabs';
import { AssessmentTable } from './components/AssessmentTable';
import { AssignAssessmentDialog } from './components/AssignAssessmentDialog';
import { AssessmentSheet } from './components/AssessmentSheet';
import { ViewReportDialog } from './components/ViewReportDialog';
import {
  PsychometricEvaluateDialog,
  LanguageEvaluateDialog,
  PerformanceEvaluateDialog,
  TechnicalEvaluateDialog,
  GenericEvaluateDialog,
} from './components/EvaluateDialog';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

// Tab Error Boundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class TabErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Assessment Tab Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 space-y-3">
          <p className="font-semibold text-sm">Failed to render this assessment section.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AssessmentsPage: React.FC = () => {
  // Tab sync with URL (?tab=...)
  const { activeTab, setActiveTab } = useAssessmentTab();

  // Filters state (reset on tab switch or manual reset)
  const { filters, setFilters, resetFilters } = useAssessmentFilters();

  // Assessment data hook
  const { tabPendingCounts, filteredRows, tabStats } = useAssessmentData(activeTab, filters);

  const evaluateAssessment = useHiringStore((state) => state.evaluateAssessment);
  const extendAssessmentDueDate = useHiringStore((state) => state.extendAssessmentDueDate);
  const sendAssessmentReminder = useHiringStore((state) => state.sendAssessmentReminder);
  const reassignAssessmentEvaluator = useHiringStore((state) => state.reassignAssessmentEvaluator);
  const cancelAssessment = useHiringStore((state) => state.cancelAssessment);

  // Dialog & Sheet States
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSheetRow, setSelectedSheetRow] = useState<AssessmentFlatRow | null>(null);
  const [reportRow, setReportRow] = useState<AssessmentFlatRow | null>(null);
  const [evaluatingRow, setEvaluatingRow] = useState<AssessmentFlatRow | null>(null);

  // Extend Modal from Table
  const [extendingRow, setExtendingRow] = useState<AssessmentFlatRow | null>(null);
  const [extendDueDate, setExtendDueDate] = useState('');

  // Reassign Modal from Table
  const [reassigningRow, setReassigningRow] = useState<AssessmentFlatRow | null>(null);
  const [newEvaluatorId, setNewEvaluatorId] = useState('');

  const activeTabConfig = ASSESSMENT_TABS.find((t) => t.id === activeTab) ?? ASSESSMENT_TABS[0]!;

  const handleTabSwitch = (newTab: typeof activeTab) => {
    setActiveTab(newTab);
    resetFilters();
  };

  const handleEvaluateSubmit = (values: Record<string, unknown>, computedScore?: number) => {
    if (!evaluatingRow) return;

    if (evaluatingRow.type === 'psychometric') {
      const openness = Number(values.openness) || 0;
      const conscientiousness = Number(values.conscientiousness) || 0;
      const extraversion = Number(values.extraversion) || 0;
      const agreeableness = Number(values.agreeableness) || 0;
      const emotionalStability = Number(values.emotionalStability) || 0;
      const band = (values.band as string) || 'Recommended';
      const remarks = (values.remarks as string) || '';

      const traits = {
        openness,
        conscientiousness,
        extraversion,
        agreeableness,
        emotionalStability,
      };
      const traitAvg = Math.round(
        (openness + conscientiousness + extraversion + agreeableness + emotionalStability) / 5
      );
      const result =
        band === 'Recommended'
          ? 'pass'
          : band === 'Recommended with Reservations'
          ? 'review'
          : 'fail';

      evaluateAssessment(evaluatingRow.candidateId, evaluatingRow.id, {
        score: traitAvg,
        result,
        remarks,
        meta: {
          ...evaluatingRow.meta,
          traits,
          band,
          completionPct: 100,
        },
      });
    } else if (evaluatingRow.type === 'language') {
      const finalScore = computedScore ?? 85;
      const result = finalScore >= (evaluatingRow.passMark || 70) ? 'pass' : 'fail';
      const reading = Number(values.reading) || 0;
      const writing = Number(values.writing) || 0;
      const listening = Number(values.listening) || 0;
      const speaking = Number(values.speaking) || 0;

      evaluateAssessment(evaluatingRow.candidateId, evaluatingRow.id, {
        score: finalScore,
        result,
        remarks: (values.remarks as string) || '',
        meta: {
          ...evaluatingRow.meta,
          modules: { reading, writing, listening, speaking },
          cefrLevel: values.cefrLevel,
          writtenSampleUrl: values.writtenSampleUrl,
        },
      });
    } else if (evaluatingRow.type === 'performance') {
      const score = Math.min(100, Math.round((computedScore ?? 4) * 20));
      const recommendation = (values.recommendation as string) || 'Meets';
      const result =
        recommendation === 'Exceeds'
          ? 'pass'
          : recommendation === 'Meets'
          ? 'review'
          : 'fail';

      evaluateAssessment(evaluatingRow.candidateId, evaluatingRow.id, {
        score,
        result,
        remarks: (values.remarks as string) || '',
        meta: {
          ...evaluatingRow.meta,
          rating: computedScore ?? 4,
          recommendation,
          competencies: {
            ownership: values.ownership,
            collaboration: values.collaboration,
            problemSolving: values.problemSolving,
            delivery: values.delivery,
            communication: values.communication,
          },
        },
      });
    } else if (evaluatingRow.type === 'technical') {
      evaluateAssessment(evaluatingRow.candidateId, evaluatingRow.id, {
        score: computedScore ?? 85,
        result: values.result as 'pass' | 'fail' | 'review',
        remarks: (values.remarks as string) || '',
        meta: {
          ...evaluatingRow.meta,
          sections: values.sections,
          repoLink: values.repoLink,
          proctored: values.proctored,
          proctoringNote: values.proctoringNote,
        },
      });
    } else {
      // AT Assessment
      evaluateAssessment(evaluatingRow.candidateId, evaluatingRow.id, {
        score: Number(values.score) || 0,
        result: values.result as 'pass' | 'fail' | 'review',
        remarks: (values.remarks as string) || '',
        meta: {
          ...evaluatingRow.meta,
        },
      });
    }

    setEvaluatingRow(null);
  };

  const handleBulkReminder = (selected: AssessmentFlatRow[]) => {
    selected.forEach((row) => {
      sendAssessmentReminder(row.candidateId, row.id);
    });
    toast.success('Reminders Dispatched', `Sent email alerts to ${selected.length} candidate(s).`);
  };

  const handleBulkExtend = (selected: AssessmentFlatRow[]) => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().slice(0, 10);
    selected.forEach((row) => {
      extendAssessmentDueDate(row.candidateId, row.id, dateStr);
    });
    toast.success('Due Dates Extended', `Extended ${selected.length} assessment(s) by 7 days.`);
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.department) ||
    Boolean(filters.dateRange) ||
    filters.overdueOnly;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SHARED PAGE HEADER */}
      <RecruiterPageHeader
        title="Assessments"
        subtitle="Manage end-to-end cognitive, psychometric, language, performance, and technical candidate batteries."
        action={
          <Button
            onClick={() => setIsAssignOpen(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white gap-2 font-medium text-xs sm:text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Assign Assessment
          </Button>
        }
      />


      {/* STAT CARDS ROW (Recomputes dynamically per active tab) */}
      <StatCardRow stats={tabStats} />

      {/* TAB BAR UI */}
      <AssessmentTabs
        activeTab={activeTab}
        onTabChange={handleTabSwitch}
        pendingCounts={tabPendingCounts}
      >
        <TabErrorBoundary>
          <div className="space-y-4">
            {/* SHARED FILTER BAR (Inside active tab panel) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                {/* Search candidate, title, evaluator */}
                <div className="lg:col-span-4">
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder={`Search candidate or ${activeTabConfig.shortLabel.toLowerCase()} title...`}
                    leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                    className="w-full text-xs"
                  />
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-2">
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    className="text-xs"
                  >
                    <option value="">All Statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="evaluated">Evaluated</option>
                    <option value="expired">Expired</option>
                  </Select>
                </div>

                {/* Department Filter */}
                <div className="lg:col-span-2">
                  <Select
                    value={filters.department}
                    onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                    className="text-xs"
                  >
                    <option value="">All Departments</option>
                    {RECRUITER_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Due Date Range Filter */}
                <div className="lg:col-span-2">
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                    className="text-xs"
                  >
                    <option value="">Any Due Date</option>
                    <option value="next_7_days">Due &lt; 7 Days</option>
                    <option value="next_14_days">Due &lt; 14 Days</option>
                    <option value="overdue">Overdue Only</option>
                  </Select>
                </div>

                {/* Overdue Only Toggle */}
                <div className="lg:col-span-2 flex items-center justify-between sm:justify-start gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={filters.overdueOnly}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, overdueOnly: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        filters.overdueOnly ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overdue only
                    </span>
                  </label>

                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 h-7 ml-auto"
                      title="Clear filters"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* TAB TABLE CONTENT */}
            <AssessmentTable
              activeTab={activeTab}
              data={filteredRows}
              onRowClick={(row) => setSelectedSheetRow(row)}
              onEvaluate={(row) => setEvaluatingRow(row)}
              onViewReport={(row) => setReportRow(row)}
              onExtendDueDate={(row) => {
                setExtendingRow(row);
                setExtendDueDate(row.dueAt);
              }}
              onSendReminder={(row) => sendAssessmentReminder(row.candidateId, row.id)}
              onReassignEvaluator={(row) => {
                setReassigningRow(row);
                setNewEvaluatorId(row.evaluatorId || '');
              }}
              onExpireAssessment={(row) => {
                if (window.confirm(`Expire assessment "${row.title}" for ${row.candidateName}?`)) {
                  cancelAssessment(row.candidateId, row.id);
                }
              }}
              onBulkReminder={handleBulkReminder}
              onBulkExtend={handleBulkExtend}
              onAssignNew={() => setIsAssignOpen(true)}
            />
          </div>
        </TabErrorBoundary>
      </AssessmentTabs>

      {/* ASSIGN ASSESSMENT DIALOG */}
      <AssignAssessmentDialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        initialType={activeTab}
      />

      {/* RIGHT SLIDE-OVER DETAIL SHEET */}
      <AssessmentSheet
        isOpen={Boolean(selectedSheetRow)}
        onClose={() => setSelectedSheetRow(null)}
        assessment={selectedSheetRow}
        onOpenEvaluate={(row) => {
          setSelectedSheetRow(null);
          setEvaluatingRow(row);
        }}
      />

      {/* VIEW PSYCHOMETRIC REPORT PREVIEW DIALOG */}
      <ViewReportDialog
        isOpen={Boolean(reportRow)}
        onClose={() => setReportRow(null)}
        assessment={reportRow}
      />

      {/* TYPE-SPECIFIC EVALUATE DIALOGS */}
      {evaluatingRow?.type === 'psychometric' && (
        <PsychometricEvaluateDialog
          isOpen={true}
          onClose={() => setEvaluatingRow(null)}
          assessment={evaluatingRow}
          onSubmit={handleEvaluateSubmit}
        />
      )}

      {evaluatingRow?.type === 'language' && (
        <LanguageEvaluateDialog
          isOpen={true}
          onClose={() => setEvaluatingRow(null)}
          assessment={evaluatingRow}
          onSubmit={handleEvaluateSubmit}
        />
      )}

      {evaluatingRow?.type === 'performance' && (
        <PerformanceEvaluateDialog
          isOpen={true}
          onClose={() => setEvaluatingRow(null)}
          assessment={evaluatingRow}
          onSubmit={handleEvaluateSubmit}
        />
      )}

      {evaluatingRow?.type === 'technical' && (
        <TechnicalEvaluateDialog
          isOpen={true}
          onClose={() => setEvaluatingRow(null)}
          assessment={evaluatingRow}
          onSubmit={handleEvaluateSubmit}
        />
      )}

      {evaluatingRow?.type === 'at' && (
        <GenericEvaluateDialog
          isOpen={true}
          onClose={() => setEvaluatingRow(null)}
          assessment={evaluatingRow}
          onSubmit={handleEvaluateSubmit}
          titlePrefix="Evaluate AT Assessment"
        />
      )}

      {/* EXTEND DUE DATE MODAL FROM ROW ACTION */}
      {extendingRow && (
        <Dialog
          isOpen={true}
          onClose={() => setExtendingRow(null)}
          title="Extend Assessment Due Date"
          maxWidth="sm"
        >
          <div className="space-y-4 text-left pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Set new deadline for {extendingRow.candidateName} for &quot;{extendingRow.title}&quot;.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Target Due Date
              </label>
              <Input
                type="date"
                value={extendDueDate}
                onChange={(e) => setExtendDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setExtendingRow(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (extendDueDate) {
                    extendAssessmentDueDate(extendingRow.candidateId, extendingRow.id, extendDueDate);
                    setExtendingRow(null);
                  }
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Confirm Extension
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* REASSIGN EVALUATOR MODAL FROM ROW ACTION */}
      {reassigningRow && (
        <Dialog
          isOpen={true}
          onClose={() => setReassigningRow(null)}
          title="Reassign Evaluator"
          maxWidth="sm"
        >
          <div className="space-y-4 text-left pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select certified reviewer for {reassigningRow.candidateName} on &quot;{reassigningRow.title}&quot;.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Certified Evaluator
              </label>
              <Select
                value={newEvaluatorId}
                onChange={(e) => setNewEvaluatorId(e.target.value)}
                className="text-xs"
              >
                {EVALUATOR_EMPLOYEES.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.role})
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setReassigningRow(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const ev = EVALUATOR_EMPLOYEES.find((e) => e.id === newEvaluatorId) || EVALUATOR_EMPLOYEES[0];
                  if (ev) {
                    reassignAssessmentEvaluator(reassigningRow.candidateId, reassigningRow.id, ev.id, ev.name);
                    setReassigningRow(null);
                  }
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                Reassign
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
