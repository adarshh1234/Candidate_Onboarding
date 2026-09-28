import { useMemo } from 'react';
import {
  useOnboardingStore,
  selectOverallProgress,
  selectCompletedStepsCount,
  selectInProgressStepsCount,
  selectPendingStepsCount,
} from '@/store/onboarding.store';
import { calculateDaysLeft } from '@/lib/utils';

export function useOnboardingProgress() {
  const candidate = useOnboardingStore((state) => state.candidate);
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const isSubmitted = useOnboardingStore((state) => state.isSubmitted);

  const overallProgress = useOnboardingStore(selectOverallProgress);
  const completedCount = useOnboardingStore(selectCompletedStepsCount);
  const inProgressCount = useOnboardingStore(selectInProgressStepsCount);
  const pendingCount = useOnboardingStore(selectPendingStepsCount);

  const daysLeft = useMemo(() => {
    return calculateDaysLeft(candidate.startDate);
  }, [candidate.startDate]);

  return {
    candidate,
    stepStatus,
    overallProgress,
    completedCount,
    inProgressCount,
    pendingCount,
    daysLeft,
    isSubmitted,
  };
}
