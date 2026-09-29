import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Volume2, Play, ExternalLink } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { AssessmentFlatRow } from '../../hooks';
import {
  languageEvaluateSchema,
  LanguageEvaluateFormValues,
} from '../../schema';
import {
  CEFR_LEVELS,
  LANGUAGE_MODULES,
} from '../../assessment.constants';

interface LanguageEvaluateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
  onSubmit: (values: LanguageEvaluateFormValues, computedOverall: number) => void;
}

export const LanguageEvaluateDialog: React.FC<LanguageEvaluateDialogProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
}) => {
  const meta = (assessment?.meta || {}) as Record<string, unknown>;
  const modules = (meta.modules || {}) as Record<string, number>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LanguageEvaluateFormValues>({
    resolver: zodResolver(languageEvaluateSchema),
    defaultValues: {
      reading: (modules.reading as number) ?? 85,
      writing: (modules.writing as number) ?? 80,
      listening: (modules.listening as number) ?? 90,
      speaking: (modules.speaking as number) ?? 85,
      cefrLevel: (meta.cefrLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') || 'C1',
      writtenSampleUrl: (meta.writtenSampleUrl as string) || 'https://apex-cdn.internal/samples/evaluation-sample.pdf',
      remarks:
        assessment?.remarks ||
        'Fluently articulated technical arguments. Spoken pace is natural and business syntax is solid.',
    },
  });

  const formValues = watch();

  // Weighted average score computed live (25% per module)
  const computedOverall = useMemo(() => {
    const r = Number(formValues.reading) || 0;
    const w = Number(formValues.writing) || 0;
    const l = Number(formValues.listening) || 0;
    const s = Number(formValues.speaking) || 0;
    return Math.round((r + w + l + s) / 4);
  }, [formValues.reading, formValues.writing, formValues.listening, formValues.speaking]);

  if (!assessment) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Evaluate Language & Communication: ${assessment.candidateName}`}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit((vals) => onSubmit(vals as LanguageEvaluateFormValues, computedOverall))}
        className="space-y-5 text-left pt-2"
      >
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Assessment Target</span>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Language: {String(meta.language || 'English')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Live Weighted Overall Score
            </span>
            <span className="font-mono text-2xl font-black text-teal-600 dark:text-teal-400">
              {computedOverall} / 100
            </span>
          </div>
        </div>

        {/* 4 Module Score Inputs with Sliders */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Module Competencies (25% weight each)
            </span>
            <span className="text-xs text-slate-400">Scale 0–100</span>
          </div>

          {LANGUAGE_MODULES.map((mod) => {
            const currentVal = Number(formValues[mod.key as keyof LanguageEvaluateFormValues] ?? 80);

            return (
              <div key={mod.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor={`input-${mod.key}`} className="font-semibold text-slate-800 dark:text-slate-200">
                    {mod.label}
                  </label>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                    {currentVal}/100
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id={`slider-${mod.key}`}
                    min={0}
                    max={100}
                    step={1}
                    value={isNaN(currentVal) ? 0 : currentVal}
                    onChange={(e) =>
                      setValue(mod.key as 'reading' | 'writing' | 'listening' | 'speaking', Number(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                    className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="w-20 shrink-0">
                    <Input
                      type="number"
                      id={`input-${mod.key}`}
                      min={0}
                      max={100}
                      className="h-8 text-xs text-right font-mono"
                      {...register(mod.key as 'reading' | 'writing' | 'listening' | 'speaking')}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CEFR Level Select */}
        <div>
          <label htmlFor="select-cefr" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            CEFR Benchmark Level
          </label>
          <Select id="select-cefr" {...register('cefrLevel')}>
            {CEFR_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl} {lvl === 'C2' ? '(Mastery / Native)' : lvl === 'C1' ? '(Effective Operational)' : lvl === 'B2' ? '(Vantage / Independent)' : ''}
              </option>
            ))}
          </Select>
          {errors.cefrLevel && (
            <p className="text-xs text-rose-500 mt-1">{errors.cefrLevel.message}</p>
          )}
        </div>

        {/* Written Sample & Audio Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-sample-url" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Written Submission Document Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="input-sample-url"
                placeholder="https://..."
                className="text-xs"
                {...register('writtenSampleUrl')}
              />
              {formValues.writtenSampleUrl && (
                <a
                  href={formValues.writtenSampleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-teal-600"
                  title="Open sample"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {errors.writtenSampleUrl && (
              <p className="text-xs text-rose-500 mt-1">{errors.writtenSampleUrl.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Recorded Spoken Sample (Simulated Audio)
            </label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full bg-teal-600 text-white hover:bg-teal-700">
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                  audio-response-oral-exam.mp3
                </p>
                <div className="w-full bg-slate-300 dark:bg-slate-700 h-1 rounded-full mt-1">
                  <div className="bg-teal-500 h-1 rounded-full w-1/3" />
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Assessor Remarks */}
        <div>
          <label htmlFor="textarea-remarks" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Assessor Evaluation Remarks
          </label>
          <Textarea
            id="textarea-remarks"
            rows={3}
            placeholder="Feedback on pronunciation, vocabulary range, business tone, and grammar..."
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
            Submit Language Evaluation
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
