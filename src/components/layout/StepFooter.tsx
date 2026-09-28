import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StepFooterProps {
  backTo?: string;
  nextTo?: string;
  canContinue?: boolean;
  onContinue?: () => void | Promise<void>;
  continueText?: string;
  backText?: string;
  isSubmitting?: boolean;
}

export const StepFooter: React.FC<StepFooterProps> = ({
  backTo,
  nextTo,
  canContinue = true,
  onContinue,
  continueText = 'Save & Continue',
  backText = 'Back',
  isSubmitting = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleContinue = async () => {
    if (onContinue) {
      await onContinue();
    }
    if (nextTo) {
      navigate(nextTo);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
      {backTo !== undefined ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {backText}
        </Button>
      ) : (
        <div />
      )}

      <Button
        type={onContinue ? 'button' : 'submit'}
        variant="primary"
        onClick={onContinue ? handleContinue : undefined}
        disabled={!canContinue || isSubmitting}
        className="w-full sm:w-auto min-w-[150px] shadow-md shadow-indigo-500/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            {continueText}
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
};
