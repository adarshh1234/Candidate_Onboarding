import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AssessmentFlatRow } from '../../hooks';
import {
  genericEvaluateSchema,
  GenericEvaluateFormValues,
} from '../../schema';

interface GenericEvaluateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
  onSubmit: (values: GenericEvaluateFormValues) => void;
  titlePrefix?: string;
}

export const GenericEvaluateDialog: React.FC<GenericEvaluateDialogProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
  titlePrefix = 'Evaluate Assessment',
}) => {
  const [userOverrodeResult, setUserOverrodeResult] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GenericEvaluateFormValues>({
    resolver: zodResolver(genericEvaluateSchema),
    defaultValues: {
      score: assessment?.score ?? 82,
      passMark: assessment?.passMark ?? 70,
      result: (assessment?.result as 'pass' | 'fail' | 'review') || 'pass',
      remarks:
        assessment?.remarks ||
        'Completed standardized testing battery meeting all requisite cognitive benchmarks.',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (!userOverrodeResult) {
      const score = Number(formValues.score) || 0;
      const passMark = Number(formValues.passMark) || 70;
      setValue('result', score >= passMark ? 'pass' : 'fail', { shouldValidate: true });
    }
  }, [formValues.score, formValues.passMark, userOverrodeResult, setValue]);

  if (!assessment) return null;

  const scoreNum = Number(formValues.score) || 0;
  const passMarkNum = Number(formValues.passMark) || 70;
  const isPassing = scoreNum >= passMarkNum;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${titlePrefix}: ${assessment.candidateName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">Assessment</span>
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block">
            {assessment.title}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Candidate: {assessment.candidateName} ({assessment.role} • {assessment.department})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Score Achieved (/100)
            </label>
            <Input
              type="number"
              {...register('score')}
              min={0}
              max={100}
              className="font-mono text-sm"
            />
            {errors.score && (
              <span className="text-xs text-rose-500">{errors.score.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pass Mark (%)
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
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Outcome Result
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
            <option value="review">Review</option>
          </Select>
          <span className="text-[11px] text-slate-400 block">
            Status: {isPassing ? (
              <span className="text-teal-600 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Meets Pass Requirement
              </span>
            ) : (
              <span className="text-rose-600 font-semibold inline-flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Below Benchmark
              </span>
            )}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Assessor Remarks
          </label>
          <Textarea
            {...register('remarks')}
            rows={3}
            placeholder="Feedback, observations, cognitive test benchmark notes..."
            className="text-xs"
          />
          {errors.remarks && (
            <span className="text-xs text-rose-500">{errors.remarks.message}</span>
          )}
        </div>

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
