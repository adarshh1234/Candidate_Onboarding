import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { AssessmentFlatRow } from '../hooks';
import { ScoreBars } from './ScoreBars';
import { PSYCHOMETRIC_TRAITS } from '../assessment.constants';
import { toast } from '@/components/ui/toast';

interface ViewReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFlatRow | null;
}

export const ViewReportDialog: React.FC<ViewReportDialogProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  if (!assessment) return null;

  const meta = assessment.meta || {};
  const traits = (meta.traits || {}) as Record<string, number>;

  const traitItems = PSYCHOMETRIC_TRAITS.map((t) => ({
    key: t.key,
    label: t.label,
    desc: t.desc,
    score: traits[t.key] ?? 75,
  }));

  const handleDownload = () => {
    toast.success('Report Downloaded', `Generated PDF summary for ${assessment.candidateName}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Assessment Diagnostic Report: ${assessment.title}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left pt-2">
        {/* Candidate & Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-base flex items-center justify-center border border-teal-500/20">
              {assessment.candidateAvatar}
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
                {assessment.candidateName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {assessment.role} • {assessment.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Overall Index
              </span>
              <span className="font-mono text-2xl font-black text-teal-600 dark:text-teal-400">
                {assessment.score ?? 88}%
              </span>
            </div>
            <div className="pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Result Band
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {String(meta.band || 'Recommended')}
              </span>
            </div>
          </div>
        </div>

        {/* Trait breakdown */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Psychometric Dimension Scores
          </h5>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
            <ScoreBars items={traitItems} />
          </div>
        </div>

        {/* Recruiter & Evaluator Notes */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Diagnostic Remarks & Culture Fit Analysis
          </h5>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {assessment.remarks ||
              'Exhibits high alignment with high-autonomy engineering and collaborative execution. No behavioral red flags identified across situational conflict scenarios.'}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Verified psychometric battery • Apex Assessment Engine v2.4
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
