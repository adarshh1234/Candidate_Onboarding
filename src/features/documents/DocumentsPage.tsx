import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileCheck } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { DOC_CONFIGS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { FileDropzone } from '@/components/common/FileDropzone';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UploadedDoc } from '@/types';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const uploadedDocs = useOnboardingStore((state) => state.uploadedDocs);
  const addUploadedDoc = useOnboardingStore((state) => state.addUploadedDoc);
  const removeUploadedDoc = useOnboardingStore((state) => state.removeUploadedDoc);
  const setStepStatus = useOnboardingStore((state) => state.setStepStatus);

  const requiredConfigs = DOC_CONFIGS.filter((c) => c.required);
  const uploadedRequiredCount = requiredConfigs.filter((cfg) =>
    uploadedDocs.some((d) => d.type === cfg.id),
  ).length;

  const canContinue = uploadedRequiredCount === requiredConfigs.length;

  const handleUploadSuccess = (doc: UploadedDoc) => {
    addUploadedDoc(doc);
    toast.success('Document Uploaded', `${doc.name} verified and encrypted.`);
  };

  const handleRemove = (docId: string) => {
    removeUploadedDoc(docId);
    toast.info('Document Removed', 'File has been deleted from your submission.');
  };

  const handleContinue = () => {
    if (!canContinue) {
      toast.error(
        'Missing Required Documents',
        `Please upload all ${requiredConfigs.length} mandatory documents before proceeding.`,
      );
      return;
    }
    setStepStatus('documents', 'completed');
    toast.success('Documents Verified', 'All necessary credentials recorded.');
    navigate('/bank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="documents"
        title="Document Verification & Records"
        description="Upload official government proofs, university certificates, and previous employment letters for compliance background check."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {uploadedRequiredCount} of {requiredConfigs.length} Required Uploaded
            </span>
            <StatusBadge status={stepStatus.documents} size="md" />
          </div>
        }
      />

      {/* Info Status Banner */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/40 dark:from-slate-900 dark:to-indigo-950/40 border-indigo-100 dark:border-indigo-900/60 text-left">
        <div className="flex items-start gap-3">
          <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100">
              Verification Guidelines
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Files are securely encrypted in transit and at rest in compliance with SOC2 Type II and
              GDPR standards. Please ensure scans are legible with all four corners visible.
            </p>
          </div>
        </div>
      </Card>

      {/* Grid of File Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOC_CONFIGS.map((config) => {
          const uploaded = uploadedDocs.find((d) => d.type === config.id);
          return (
            <FileDropzone
              key={config.id}
              config={config}
              uploadedDoc={uploaded}
              onUploadSuccess={handleUploadSuccess}
              onRemove={handleRemove}
            />
          );
        })}
      </div>

      {/* Reminder if missing any required */}
      {!canContinue && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            You must upload all mandatory documents ({uploadedRequiredCount}/{requiredConfigs.length} completed) to continue to Bank & Tax setup.
          </span>
        </div>
      )}

      {/* Step Footer */}
      <StepFooter
        backTo="/personal"
        canContinue={canContinue}
        onContinue={handleContinue}
        continueText="Continue to Bank & Tax"
      />
    </div>
  );
};
