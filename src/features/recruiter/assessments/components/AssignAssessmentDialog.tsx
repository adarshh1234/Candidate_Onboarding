import React, { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Search,
  X,
  AlertTriangle,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { AssessmentType } from '@/types';
import {
  ASSESSMENT_TABS,
  EVALUATOR_EMPLOYEES,
} from '../assessment.constants';
import {
  assignAssessmentSchema,
  AssignAssessmentFormValues,
} from '../schema';

interface AssignAssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: AssessmentType;
  onAssigned?: () => void;
}

export const AssignAssessmentDialog: React.FC<AssignAssessmentDialogProps> = ({
  isOpen,
  onClose,
  initialType,
  onAssigned,
}) => {
  const candidates = useHiringStore((state) => state.candidates);
  const assignAssessment = useHiringStore((state) => state.assignAssessment);

  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Compute default due date 7 days from now
  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  type AssessmentTrackId = 'psychometric' | 'language' | 'performance' | 'technical' | 'at';
  const VALID_TRACK_IDS = ['psychometric', 'language', 'performance', 'technical', 'at'] as const;
  // Normalize initialType to a valid track id (legacy values fall back to 'psychometric')
  const normalizedType: AssessmentTrackId = VALID_TRACK_IDS.includes(initialType as AssessmentTrackId)
    ? (initialType as AssessmentTrackId)
    : 'psychometric';

  const tabConfig = useMemo(
    () => ASSESSMENT_TABS.find((t) => t.id === normalizedType) ?? ASSESSMENT_TABS[0]!,
    [normalizedType]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignAssessmentFormValues>({
    resolver: zodResolver(assignAssessmentSchema),
    defaultValues: {
      type: normalizedType,
      title: tabConfig.defaultTitle,
      candidateIds: [],
      dueAt: defaultDueDate,
      passMark: 70,
      evaluatorId: EVALUATOR_EMPLOYEES[0]?.id,
      instructions:
        'Please complete this assessment carefully within the allotted window. Ensure uninterrupted focus and environment requirements are met.',
    },
  });

  const watchType = watch('type');
  const watchDueAt = watch('dueAt');

  // Update default title when type changes
  useEffect(() => {
    const selectedTab = ASSESSMENT_TABS.find((t) => t.id === watchType);
    if (selectedTab) {
      setValue('title', selectedTab.defaultTitle);
    }
  }, [watchType, setValue]);

  // Sync selected candidates with react-hook-form
  useEffect(() => {
    setValue('candidateIds', selectedCandidateIds, { shouldValidate: true });
  }, [selectedCandidateIds, setValue]);

  // Keep type synced when normalizedType changes
  useEffect(() => {
    if (isOpen) {
      setValue('type', normalizedType);
      const conf = ASSESSMENT_TABS.find((t) => t.id === normalizedType) ?? ASSESSMENT_TABS[0]!;
      setValue('title', conf.defaultTitle);
      setSelectedCandidateIds([]);
      setDateWarning(null);
    }
  }, [isOpen, normalizedType, setValue]);

  // Check candidate start dates against due date for warning
  const selectedCandidates = useMemo(() => {
    return candidates.filter((c) => selectedCandidateIds.includes(c.id));
  }, [candidates, selectedCandidateIds]);

  useEffect(() => {
    if (!watchDueAt) {
      setDateWarning(null);
      return;
    }

    if (watchDueAt < todayStr) {
      setDateWarning('Error: Due date cannot be in the past.');
      return;
    }

    // Check if due date is after candidate start date
    const violatedCandidate = selectedCandidates.find((c) => c.startDate && watchDueAt > c.startDate);
    if (violatedCandidate) {
      setDateWarning(
        `Warning: Due date (${watchDueAt}) is after candidate start date (${violatedCandidate.startDate}) for ${violatedCandidate.name}.`
      );
    } else {
      setDateWarning(null);
    }
  }, [watchDueAt, selectedCandidates, todayStr]);

  // Filter candidate pool
  const candidatePool = useMemo(() => {
    if (!candidateSearch.trim()) return candidates.slice(0, 8);
    const q = candidateSearch.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
    );
  }, [candidates, candidateSearch]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const removeCandidate = (id: string) => {
    setSelectedCandidateIds((prev) => prev.filter((item) => item !== id));
  };

  const handleFormSubmit: SubmitHandler<AssignAssessmentFormValues> = (values) => {
    if (values.dueAt < todayStr) {
      return;
    }

    // If due date is after start date, block or warn
    const violated = selectedCandidates.find((c) => c.startDate && values.dueAt > c.startDate);
    if (violated) {
      setDateWarning(
        `Warning: Due date cannot be after candidate start date (${violated.startDate}) for ${violated.name}. Assignment blocked.`
      );
      return;
    }

    const evaluator = EVALUATOR_EMPLOYEES.find((e) => e.id === values.evaluatorId);

    // Bulk assign across all selected candidates
    assignAssessment(values.candidateIds, {
      type: values.type,
      title: values.title,
      dueAt: values.dueAt,
      passMark: values.passMark,
      evaluatorId: values.evaluatorId,
      instructions: values.instructions,
      meta: { evaluatorName: evaluator?.name },
    });

    reset();
    setSelectedCandidateIds([]);
    onClose();
    if (onAssigned) onAssigned();
  };

  const isBlockedByDate = Boolean(
    (watchDueAt && watchDueAt < todayStr) ||
    selectedCandidates.some((c) => c.startDate && watchDueAt > c.startDate)
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Assessment"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-left pt-1">
        {/* Type & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Assessment Track
            </label>
            <Select {...register('type')} className="text-xs font-medium">
              {ASSESSMENT_TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </Select>
            {errors.type && <span className="text-xs text-rose-500">{errors.type.message}</span>}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Title / Standard Template
            </label>
            <Input
              {...register('title')}
              placeholder="e.g. Executive Cognitive Battery"
              className="text-xs font-medium"
            />
            {errors.title && <span className="text-xs text-rose-500">{errors.title.message}</span>}
          </div>
        </div>

        {/* Candidate Multi-select Section */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              Target Candidates ({selectedCandidateIds.length} selected)
            </label>
            {selectedCandidateIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCandidateIds([])}
                className="text-[11px] text-slate-400 hover:text-rose-500"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected Candidate Chips */}
          {selectedCandidateIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {selectedCandidates.map((cand) => (
                <span
                  key={cand.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                >
                  <span className="w-4 h-4 rounded-full bg-teal-200 dark:bg-teal-800 text-[9px] flex items-center justify-center font-bold">
                    {cand.name.charAt(0)}
                  </span>
                  <span>{cand.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({cand.role})</span>
                  <button
                    type="button"
                    onClick={() => removeCandidate(cand.id)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Candidate Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search candidate by name, role, email..."
              className="pl-9 text-xs h-9 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Candidate Selector List */}
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 bg-white dark:bg-slate-950">
            {candidatePool.map((cand) => {
              const isSelected = selectedCandidateIds.includes(cand.id);
              return (
                <div
                  key={cand.id}
                  onClick={() => toggleCandidate(cand.id)}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-slate-300 text-teal-600 pointer-events-none"
                    />
                    <div>
                      <span className="font-medium">{cand.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        {cand.role} • {cand.department}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Starts: {cand.startDate || 'TBD'}
                  </div>
                </div>
              );
            })}
          </div>
          {errors.candidateIds && (
            <span className="text-xs text-rose-500 block">{errors.candidateIds.message}</span>
          )}
        </div>

        {/* Due Date & Pass Mark & Evaluator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="assign-due-date" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 block mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Target Due Date
            </label>
            <Input
              id="assign-due-date"
              type="date"
              {...register('dueAt')}
              min={todayStr}
              className="text-xs font-mono"
            />
            {errors.dueAt && <span className="text-xs text-rose-500">{errors.dueAt.message}</span>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Pass Benchmark (%)
            </label>
            <Input
              type="number"
              {...register('passMark')}
              min={0}
              max={100}
              className="text-xs font-mono"
            />
            {errors.passMark && (
              <span className="text-xs text-rose-500">{errors.passMark.message}</span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Assigned Evaluator
            </label>
            <Select {...register('evaluatorId')} className="text-xs">
              {EVALUATOR_EMPLOYEES.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.role.split(' ')[0]})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Date Warning Banner */}
        {dateWarning && (
          <div
            role="alert"
            className={`p-3 rounded-lg flex items-start gap-2.5 text-xs ${
              dateWarning.startsWith('Error') || dateWarning.includes('cannot be after')
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold block">{dateWarning}</span>
              <span className="text-[11px] opacity-90 block mt-0.5">
                {dateWarning.includes('past')
                  ? 'Assessments must be scheduled for today or future dates.'
                  : 'Due dates should precede the candidate start date so evaluations conclude prior to onboarding day 1.'}
              </span>
            </div>
          </div>
        )}

        {/* Candidate Instructions */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Candidate Instructions & Context
          </label>
          <Textarea
            {...register('instructions')}
            rows={2}
            placeholder="Instructions sent to candidate portal..."
            className="text-xs"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            {selectedCandidateIds.length} candidate(s) queued for assignment
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedCandidateIds.length === 0 || isBlockedByDate}
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium"
            >
              {isSubmitting
                ? 'Assigning...'
                : `Assign Assessment (${selectedCandidateIds.length})`}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
