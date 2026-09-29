import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AssessmentFlatRow } from '../../hooks';
import {
  psychometricEvaluateSchema,
  PsychometricEvaluateFormValues,
} from '../../schema';
import {
  PSYCHOMETRIC_TRAITS,
  PSYCHOMETRIC_BANDS,
} from '../../assessment.constants';

interface PsychometricEvaluateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
  onSubmit: (values: PsychometricEvaluateFormValues) => void;
  onViewReport?: () => void;
}

export const PsychometricEvaluateDialog: React.FC<PsychometricEvaluateDialogProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
  onViewReport,
}) => {
  const meta = (assessment?.meta || {}) as Record<string, unknown>;
  const traits = (meta.traits || {}) as Record<string, number>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PsychometricEvaluateFormValues>({
    resolver: zodResolver(psychometricEvaluateSchema),
    defaultValues: {
      openness: (traits.openness as number) ?? 85,
      conscientiousness: (traits.conscientiousness as number) ?? 88,
      extraversion: (traits.extraversion as number) ?? 75,
      agreeableness: (traits.agreeableness as number) ?? 80,
      emotionalStability: (traits.emotionalStability as number) ?? 82,
      band: (meta.band as 'Recommended' | 'Recommended with Reservations' | 'Not Recommended') || 'Recommended',
      remarks:
        assessment?.remarks ||
        'Exhibits balanced emotional composure and strong alignment with collaborative values.',
    },
  });

  const formValues = watch();

  if (!assessment) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Psychometric Battery: ${assessment.candidateName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit as SubmitHandler<PsychometricEvaluateFormValues>)} className="space-y-5 text-left pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review psychometric dimensions, calibrate trait percentiles, and confirm overall hiring recommendation band.
        </p>

        {/* Trait Calibration Sliders */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Big Five Dimensions
            </span>
            <span className="text-xs text-slate-400">Normalized Percentile (0–100)</span>
          </div>

          {PSYCHOMETRIC_TRAITS.map((trait) => {
            const currentVal = Number(formValues[trait.key as keyof PsychometricEvaluateFormValues] ?? 75);

            return (
              <div key={trait.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <label htmlFor={`input-${trait.key}`} className="font-semibold text-slate-800 dark:text-slate-200">
                      {trait.label}
                    </label>
                    <p className="text-[11px] text-slate-400">{trait.desc}</p>
                  </div>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                    {currentVal}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id={`input-${trait.key}`}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    {...register(trait.key as 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotionalStability')}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Band Recommendation */}
        <div>
          <label htmlFor="select-band" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Overall Recommendation Band
          </label>
          <Select id="select-band" {...register('band')}>
            {PSYCHOMETRIC_BANDS.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </Select>
          {errors.band && (
            <p className="text-xs text-rose-500 mt-1">{errors.band.message}</p>
          )}
        </div>

        {/* Recruiter Remarks */}
        <div>
          <label htmlFor="textarea-remarks" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Recruiter & Assessor Remarks
          </label>
          <Textarea
            id="textarea-remarks"
            rows={3}
            placeholder="Document key behavioral strengths, observed culture signals, or development areas..."
            {...register('remarks')}
          />
          {errors.remarks && (
            <p className="text-xs text-rose-500 mt-1">{errors.remarks.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {onViewReport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onViewReport}
              className="text-xs"
            >
              Preview Mock Diagnostic Report
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save & Finalize Evaluation
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
