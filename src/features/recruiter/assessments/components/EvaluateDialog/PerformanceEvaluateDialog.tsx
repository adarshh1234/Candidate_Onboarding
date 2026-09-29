import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AssessmentFlatRow } from '../../hooks';
import { StarRating } from '../StarRating';
import {
  performanceEvaluateSchema,
  PerformanceEvaluateFormValues,
} from '../../schema';
import {
  PERFORMANCE_COMPETENCIES,
  PERFORMANCE_RECOMMENDATIONS,
} from '../../assessment.constants';

interface PerformanceEvaluateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
  onSubmit: (values: PerformanceEvaluateFormValues, computedRating: number, computedScore: number) => void;
}

export const PerformanceEvaluateDialog: React.FC<PerformanceEvaluateDialogProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
}) => {
  const meta = (assessment?.meta || {}) as Record<string, unknown>;
  const comp = (meta.competencies || {}) as Record<string, number>;
  const ev = (meta.evidence || {}) as Record<string, string>;

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PerformanceEvaluateFormValues>({
    resolver: zodResolver(performanceEvaluateSchema),
    defaultValues: {
      ownership: (comp.ownership as number) ?? 4,
      collaboration: (comp.collaboration as number) ?? 4,
      problemSolving: (comp.problemSolving as number) ?? 4,
      delivery: (comp.delivery as number) ?? 4,
      communication: (comp.communication as number) ?? 4,
      evidenceOwnership: (ev.ownership as string) || '',
      evidenceCollaboration: (ev.collaboration as string) || '',
      evidenceProblemSolving: (ev.problemSolving as string) || '',
      evidenceDelivery: (ev.delivery as string) || '',
      evidenceCommunication: (ev.communication as string) || '',
      recommendation: (meta.recommendation as 'Exceeds' | 'Meets' | 'Below') || 'Meets',
      remarks:
        assessment?.remarks ||
        'Strong tactical execution and clear stakeholder updates. Consistently takes ownership of blockers.',
    },
  });

  const formValues = watch();

  // Computed overall star rating and score (1-5 converted to percentage 20-100)
  const { computedRating, computedScore } = useMemo(() => {
    const o = Number(formValues.ownership) || 0;
    const c = Number(formValues.collaboration) || 0;
    const p = Number(formValues.problemSolving) || 0;
    const d = Number(formValues.delivery) || 0;
    const comm = Number(formValues.communication) || 0;

    const avgStars = Math.round((o + c + p + d + comm) / 5);
    const score = Math.round(((o + c + p + d + comm) / 25) * 100);

    return { computedRating: Math.max(1, Math.min(5, avgStars)), computedScore: score };
  }, [
    formValues.ownership,
    formValues.collaboration,
    formValues.problemSolving,
    formValues.delivery,
    formValues.communication,
  ]);

  if (!assessment) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Performance Simulation: ${assessment.candidateName}`}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit((vals) => onSubmit(vals as PerformanceEvaluateFormValues, computedRating, computedScore))}
        className="space-y-5 text-left pt-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Simulation Subtype</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {String(meta.assessmentSubtype || 'Work Simulation')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Computed Rating
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating value={computedRating} size="md" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {computedRating}.0/5
                </span>
              </div>
            </div>

            <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Score Equivalent
              </span>
              <span className="font-mono text-xl font-black text-teal-600 dark:text-teal-400">
                {computedScore}%
              </span>
            </div>
          </div>
        </div>

        {/* 5 Competency Rubrics */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Core Competency Rubric
            </span>
            <span className="text-xs text-slate-400">Rate 1 to 5 Stars</span>
          </div>

          {PERFORMANCE_COMPETENCIES.map((compItem) => {
            const currentStars = Number(formValues[compItem.key as keyof PerformanceEvaluateFormValues] ?? 4);
            const descriptorText = (compItem.descriptors as Record<number, string>)[currentStars] || '';
            const evidenceFieldName = `evidence${compItem.key.charAt(0).toUpperCase() + compItem.key.slice(1)}` as keyof PerformanceEvaluateFormValues;

            return (
              <div key={compItem.key} className="space-y-2 pb-3 border-b border-slate-200/60 dark:border-slate-800 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {compItem.label}
                    </label>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      Level {currentStars}: {descriptorText}
                    </p>
                  </div>

                  <Controller
                    control={control}
                    name={compItem.key as 'ownership' | 'collaboration' | 'problemSolving' | 'delivery' | 'communication'}
                    render={({ field }) => (
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        readOnly={false}
                        size="md"
                      />
                    )}
                  />
                </div>

                <Input
                  placeholder={`Observed evidence or work snippet for ${compItem.label.toLowerCase()}...`}
                  className="text-xs h-8 bg-white dark:bg-slate-950"
                  {...register(evidenceFieldName)}
                />
              </div>
            );
          })}
        </div>

        {/* Final Recommendation */}
        <div>
          <label htmlFor="select-recommendation" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Overall Performance Recommendation
          </label>
          <Select id="select-recommendation" {...register('recommendation')}>
            {PERFORMANCE_RECOMMENDATIONS.map((rec) => (
              <option key={rec} value={rec}>
                {rec} {rec === 'Exceeds' ? '— Exceeds Role Expectations' : rec === 'Meets' ? '— Meets Standard Bar' : '— Below Required Standard'}
              </option>
            ))}
          </Select>
          {errors.recommendation && (
            <p className="text-xs text-rose-500 mt-1">{errors.recommendation.message}</p>
          )}
        </div>

        {/* Evaluator Summary */}
        <div>
          <label htmlFor="textarea-summary" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Evaluator Performance Summary
          </label>
          <Textarea
            id="textarea-summary"
            rows={3}
            placeholder="Synthesize overall simulation findings and key qualitative observations..."
            {...register('remarks')}
          />
          {errors.remarks && (
            <p className="text-xs text-rose-500 mt-1">{errors.remarks.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Save Performance Evaluation
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
