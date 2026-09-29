import React, { useMemo, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ShieldCheck, ShieldAlert, GitFork, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { AssessmentFlatRow } from '../../hooks';
import {
  technicalEvaluateSchema,
  TechnicalEvaluateFormValues,
} from '../../schema';

interface TechnicalEvaluateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
  onSubmit: (values: TechnicalEvaluateFormValues, totalScore: number) => void;
}

export const TechnicalEvaluateDialog: React.FC<TechnicalEvaluateDialogProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
}) => {
  const meta = (assessment?.meta || {}) as Record<string, unknown>;
  const initialSections = meta.sections && Array.isArray(meta.sections) && (meta.sections as unknown[]).length > 0
    ? (meta.sections as Array<{ name: string; score: number; maxScore: number }>)
    : [
        { name: 'Data Structures & Algorithms', score: 32, maxScore: 40 },
        { name: 'Domain Architecture & System Design', score: 28, maxScore: 30 },
        { name: 'Problem Solving & Clean Code', score: 25, maxScore: 30 },
      ];

  const defaultPassMark = assessment?.passMark || 70;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TechnicalEvaluateFormValues>({
    resolver: zodResolver(technicalEvaluateSchema),
    defaultValues: {
      sections: initialSections,
      passMark: defaultPassMark,
      repoLink: (meta.repoLink as string) || 'https://github.com/apex-eval/candidate-submission-402',
      proctored: (meta.proctored as boolean) ?? true,
      proctoringNote: (meta.proctoringNote as string) || 'Zero suspicious tabs detected. Webcam verified.',
      result: (assessment?.result as 'pass' | 'fail' | 'review') || 'pass',
      remarks:
        assessment?.remarks ||
        'Strong mastery of system design principles, robust algorithmic efficiency, and clean TypeScript implementation.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  const formValues = watch();
  const [userOverrodeResult, setUserOverrodeResult] = useState(false);

  // Compute total earned and total max
  const { totalScore, totalMax, percentage } = useMemo(() => {
    const secs = formValues.sections || [];
    let earned = 0;
    let max = 0;
    secs.forEach((s) => {
      earned += Number(s.score) || 0;
      max += Number(s.maxScore) || 0;
    });
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
    return { totalScore: earned, totalMax: max, percentage: pct };
  }, [formValues.sections]);

  // Auto-suggest Pass/Fail from passMark unless overridden manually by user
  useEffect(() => {
    if (!userOverrodeResult) {
      const mark = Number(formValues.passMark) || 70;
      const suggested = percentage >= mark ? 'pass' : 'fail';
      setValue('result', suggested, { shouldValidate: true });
    }
  }, [percentage, formValues.passMark, userOverrodeResult, setValue]);

  if (!assessment) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Technical Assessment: ${assessment.candidateName}`}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit((vals) => onSubmit(vals as TechnicalEvaluateFormValues, percentage))}
        className="space-y-5 text-left pt-2"
      >
        {/* Header Summary Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Track: {String(meta.track || 'Backend')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {String(meta.format || 'Live Coding')}
              </span>
              <span className="text-xs text-slate-400">
                via {String(meta.platform || 'CoderPad')}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mt-1">
              {assessment.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Score Earned
              </span>
              <span className="font-mono text-xl font-bold text-slate-800 dark:text-slate-100">
                {totalScore} <span className="text-sm text-slate-400">/ {totalMax}</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Total Percentage
              </span>
              <span
                className={`font-mono text-2xl font-black ${
                  percentage >= (Number(formValues.passMark) || 70)
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Section-wise scores */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Section-wise Scores
              </h4>
              <p className="text-xs text-slate-400">
                Breakdown of performance across algorithmic and engineering criteria.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: 'System Optimization', score: 20, maxScore: 25 })}
              className="text-xs h-7"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Section
            </Button>
          </div>

          <div className="space-y-2.5">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex-1">
                  <Input
                    {...register(`sections.${idx}.name` as const)}
                    placeholder="Section Name"
                    className="h-8 text-xs font-medium"
                  />
                  {errors.sections?.[idx]?.name && (
                    <span className="text-[10px] text-rose-500">
                      {errors.sections[idx]?.name?.message}
                    </span>
                  )}
                </div>

                <div className="w-24">
                  <Input
                    type="number"
                    {...register(`sections.${idx}.score` as const)}
                    placeholder="Score"
                    min={0}
                    className="h-8 text-xs text-right font-mono"
                  />
                </div>
                <span className="text-xs text-slate-400">/</span>
                <div className="w-24">
                  <Input
                    type="number"
                    {...register(`sections.${idx}.maxScore` as const)}
                    placeholder="Max"
                    min={1}
                    className="h-8 text-xs text-right font-mono"
                  />
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pass Mark & Decision Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pass Benchmark Mark (%)
            </label>
            <Input
              type="number"
              {...register('passMark')}
              min={0}
              max={100}
              className="font-mono text-sm"
            />
            {errors.passMark && (
              <span className="text-xs text-rose-500">{errors.passMark.message}</span>
            )}
            <span className="text-[11px] text-slate-400 block">
              Auto-check indicator:{' '}
              {percentage >= (Number(formValues.passMark) || 70) ? (
                <span className="text-teal-600 dark:text-teal-400 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Meets Pass Requirement
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Below Benchmark
                </span>
              )}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Evaluation Result (Auto-suggested)
            </label>
            <Select
              {...register('result', {
                onChange: () => setUserOverrodeResult(true),
              })}
              value={formValues.result}
              className="text-sm"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="review">Review / Borderline</option>
            </Select>
            <span className="text-[11px] text-slate-400 block">
              Result is auto-derived from benchmark and remains editable.
            </span>
          </div>
        </div>

        {/* Repository / Submission Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-slate-500" />
            Repository / Code Artifact Link
          </label>
          <Input
            type="url"
            {...register('repoLink')}
            placeholder="https://github.com/..."
            className="text-xs font-mono"
          />
          {errors.repoLink && (
            <span className="text-xs text-rose-500">{errors.repoLink.message}</span>
          )}
        </div>

        {/* Proctoring Verification Section */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('proctored')}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {formValues.proctored ? (
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                )}
                Proctoring Verified
              </span>
            </label>
            <span className="text-[10px] text-slate-400">Integrity Check</span>
          </div>

          <Input
            {...register('proctoringNote')}
            placeholder="Proctoring audit notes (e.g. Browser lockdown verified, no anomalies)"
            className="text-xs h-8 bg-white dark:bg-slate-950"
          />
        </div>

        {/* Interviewer Notes & Remarks */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Interviewer Technical Notes & Remarks
          </label>
          <Textarea
            {...register('remarks')}
            rows={3}
            placeholder="Detailed feedback regarding algorithmic choice, maintainability, architectural design..."
            className="text-xs"
          />
          {errors.remarks && (
            <span className="text-xs text-rose-500">{errors.remarks.message}</span>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-700 hover:bg-teal-800 text-white font-medium"
          >
            {isSubmitting ? 'Saving...' : 'Submit Evaluation'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
