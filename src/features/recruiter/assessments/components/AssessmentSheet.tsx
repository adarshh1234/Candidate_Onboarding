import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Send,
  CalendarPlus,
  UserCog,
  Ban,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { AssessmentFlatRow } from '../hooks';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { ScoreBars } from './ScoreBars';
import { StarRating } from './StarRating';
import { useHiringStore } from '@/store/hiring.store';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EVALUATOR_EMPLOYEES } from '../assessment.constants';

interface AssessmentSheetProps {
  assessment: AssessmentFlatRow | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEvaluate?: (assessment: AssessmentFlatRow) => void;
}

export const AssessmentSheet: React.FC<AssessmentSheetProps> = ({
  assessment,
  isOpen,
  onClose,
  onOpenEvaluate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'timeline' | 'remarks'>('overview');
  
  // Extend due date modal state
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  
  // Reassign evaluator modal state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [newEvaluatorId, setNewEvaluatorId] = useState(EVALUATOR_EMPLOYEES[0]?.id || '');

  const extendAssessmentDueDate = useHiringStore((state) => state.extendAssessmentDueDate);
  const sendAssessmentReminder = useHiringStore((state) => state.sendAssessmentReminder);
  const reassignAssessmentEvaluator = useHiringStore((state) => state.reassignAssessmentEvaluator);
  const cancelAssessment = useHiringStore((state) => state.cancelAssessment);
  const activityLog = useHiringStore((state) => state.activityLog);

  if (!assessment) return null;

  const meta = (assessment.meta || {}) as Record<string, unknown>;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter relevant activity log entries
  const assessmentLogs = activityLog.filter(
    (log) => log.candidateId === assessment.candidateId
  );

  const handleSendReminder = () => {
    sendAssessmentReminder(assessment.candidateId, assessment.id);
  };

  const handleConfirmExtend = () => {
    if (!newDueDate) return;
    extendAssessmentDueDate(assessment.candidateId, assessment.id, newDueDate);
    setIsExtendOpen(false);
  };

  const handleConfirmReassign = () => {
    const ev = EVALUATOR_EMPLOYEES.find((e) => e.id === newEvaluatorId);
    if (!ev) return;
    reassignAssessmentEvaluator(assessment.candidateId, assessment.id, ev.id, ev.name);
    setIsReassignOpen(false);
  };

  const handleCancelAssessment = () => {
    if (window.confirm(`Are you sure you want to expire/cancel assessment "${assessment.title}"?`)) {
      cancelAssessment(assessment.candidateId, assessment.id);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-full sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col text-left"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-teal-600/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-lg border border-teal-500/20 shrink-0">
                        {assessment.candidateAvatar}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                            {assessment.candidateName}
                          </h3>
                          <StatusPill status={assessment.status} size="sm" />
                          {assessment.isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {assessment.title}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          <span>{assessment.role}</span>
                          <span>•</span>
                          <span>{assessment.department}</span>
                          <span>•</span>
                          <span className="font-mono">Due: {assessment.dueAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Close sheet"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => onOpenEvaluate && onOpenEvaluate(assessment)}
                      disabled={assessment.status === 'expired'}
                      className="text-xs bg-teal-700 hover:bg-teal-800 text-white gap-1.5 h-8"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      {assessment.status === 'evaluated' ? 'Re-evaluate' : 'Evaluate'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendReminder}
                      disabled={assessment.status === 'evaluated' || assessment.status === 'expired'}
                      className="text-xs gap-1.5 h-8"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                      Send Reminder
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewDueDate(assessment.dueAt);
                        setIsExtendOpen(true);
                      }}
                      className="text-xs gap-1.5 h-8"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                      Extend Due Date
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReassignOpen(true)}
                      className="text-xs gap-1.5 h-8"
                    >
                      <UserCog className="w-3.5 h-3.5 text-slate-500" />
                      Reassign
                    </Button>

                    {assessment.status !== 'expired' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelAssessment}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5 h-8 ml-auto"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Expire
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sub-tab navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
                  {(['overview', 'scores', 'timeline', 'remarks'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-3.5 text-xs font-semibold border-b-2 capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Stat summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Assigned On
                          </span>
                          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 block mt-1">
                            {assessment.assignedAt}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Due Date
                          </span>
                          <span className={`text-xs font-mono font-semibold block mt-1 ${
                            assessment.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {assessment.dueAt}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Pass Mark
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block mt-1">
                            {assessment.passMark}%
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Result
                          </span>
                          <div className="mt-1">
                            {assessment.result ? (
                              <StatusPill status={assessment.result} size="sm" />
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Evaluator & Candidate details */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Assignment Metadata
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Assigned Evaluator</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {assessment.evaluatorName || 'Apex Evaluator Pool'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Candidate Email</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {assessment.candidateEmail}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Candidate Start Date</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {assessment.candidateRef.startDate || 'Not configured'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Recruiter Lead</span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {assessment.candidateRef.recruiterOwner}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'scores' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-xs text-slate-400 block font-semibold uppercase">
                            Overall Assessment Score
                          </span>
                          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1 block">
                            {assessment.score !== undefined ? `${assessment.score} / ${assessment.maxScore}` : 'Not Evaluated'}
                          </span>
                        </div>
                        <div>
                          {assessment.result && <StatusPill status={assessment.result} size="md" />}
                        </div>
                      </div>

                      {/* Type-specific breakdown */}
                      {assessment.type === 'psychometric' && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Psychometric Big-Five Dimensional Profile
                          </h4>
                          {meta.traits ? (
                            <ScoreBars items={[
                              { key: 'openness', label: 'Openness', score: Number((meta.traits as Record<string, unknown>).openness) || 75 },
                              { key: 'conscientiousness', label: 'Conscientiousness', score: Number((meta.traits as Record<string, unknown>).conscientiousness) || 75 },
                              { key: 'extraversion', label: 'Extraversion', score: Number((meta.traits as Record<string, unknown>).extraversion) || 75 },
                              { key: 'agreeableness', label: 'Agreeableness', score: Number((meta.traits as Record<string, unknown>).agreeableness) || 75 },
                              { key: 'emotionalStability', label: 'Emotional Stability', score: Number((meta.traits as Record<string, unknown>).emotionalStability) || 75 },
                            ]} />
                          ) : (
                            <p className="text-xs text-slate-400 italic">No trait breakdown submitted yet.</p>
                          )}
                          {Boolean(meta.band) && (
                            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs">
                              <span className="text-slate-500 block text-[11px]">Recommended Band:</span>
                              <span className="font-bold text-teal-800 dark:text-teal-300">{String(meta.band)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {assessment.type === 'language' && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            CEFR Fluency & Module Breakdown
                          </h4>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Evaluated CEFR Tier:
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-600 text-white font-mono">
                              {String(meta.cefrLevel || 'B2')}
                            </span>
                          </div>

                          {Boolean(meta.modules) && (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {Object.entries(meta.modules as Record<string, unknown>).map(([mod, val]) => (
                                <div key={mod} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                  <span className="text-slate-400 capitalize block text-[11px]">{mod}</span>
                                  <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                                    {String(val)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {assessment.type === 'performance' && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Competency Rubric Rating
                          </h4>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                            <StarRating value={Number(meta.rating) || 4} readOnly size="md" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              ({String(meta.recommendation || 'Meets')} Expectations)
                            </span>
                          </div>
                        </div>
                      )}

                      {assessment.type === 'technical' && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Technical Sections Breakdown
                          </h4>
                          {meta.sections && Array.isArray(meta.sections) ? (
                            <div className="space-y-2">
                              {(meta.sections as Array<{ name: string; score: number; maxScore: number }>).map((sec, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                                >
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{sec.name}</span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    {sec.score} / {sec.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No section breakdown available.</p>
                          )}

                          {Boolean(meta.repoLink) && (
                            <a
                              href={String(meta.repoLink)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-teal-600 hover:underline flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Code Repository Submission
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Activity & Notification Trail
                      </h4>
                      {assessmentLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No activity history logged yet.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {assessmentLogs.map((log) => (
                            <div
                              key={log.id}
                              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/30"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {log.action}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {log.timestamp.slice(0, 10)}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'remarks' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Assessor & Interviewer Remarks
                      </h4>
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {assessment.remarks || 'No remarks recorded for this assessment yet.'}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Extend Due Date Dialog */}
      <Dialog
        isOpen={isExtendOpen}
        onClose={() => setIsExtendOpen(false)}
        title="Extend Assessment Due Date"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Extend deadline for {assessment.candidateName} for &quot;{assessment.title}&quot;.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              New Due Date
            </label>
            <Input
              type="date"
              value={newDueDate}
              min={todayStr}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsExtendOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmExtend}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              Confirm Extension
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reassign Evaluator Dialog */}
      <Dialog
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        title="Reassign Evaluator"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select a new certified evaluator for this assessment.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Evaluator
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
            <Button variant="outline" size="sm" onClick={() => setIsReassignOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReassign}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              Reassign
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
