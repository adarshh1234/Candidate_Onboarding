import { describe, it, expect, beforeEach } from 'vitest';
import {
  useOnboardingStore,
  selectOverallProgress,
  selectCompletedStepsCount,
} from '@/store/onboarding.store';

describe('useOnboardingStore & Selectors', () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding();
  });

  it('calculates initial overall progress as 0%', () => {
    const state = useOnboardingStore.getState();
    expect(selectOverallProgress(state)).toBe(0);
    expect(selectCompletedStepsCount(state)).toBe(0);
  });

  it('updates overall progress accurately as steps complete', () => {
    const { setStepStatus } = useOnboardingStore.getState();

    setStepStatus('welcome', 'completed');
    let state = useOnboardingStore.getState();
    // 1 / 8 = 12.5% -> rounded to 13%
    expect(selectCompletedStepsCount(state)).toBe(1);
    expect(selectOverallProgress(state)).toBe(13);

    setStepStatus('personal', 'completed');
    state = useOnboardingStore.getState();
    // 2 / 8 = 25%
    expect(selectCompletedStepsCount(state)).toBe(2);
    expect(selectOverallProgress(state)).toBe(25);

    setStepStatus('documents', 'completed');
    setStepStatus('bank', 'completed');
    state = useOnboardingStore.getState();
    // 4 / 8 = 50%
    expect(selectCompletedStepsCount(state)).toBe(4);
    expect(selectOverallProgress(state)).toBe(50);
  });

  it('reaches 100% when all 8 steps are completed', () => {
    const { setStepStatus } = useOnboardingStore.getState();
    setStepStatus('welcome', 'completed');
    setStepStatus('personal', 'completed');
    setStepStatus('documents', 'completed');
    setStepStatus('bank', 'completed');
    setStepStatus('policies', 'completed');
    setStepStatus('training', 'completed');
    setStepStatus('team', 'completed');
    setStepStatus('checklist', 'completed');

    const state = useOnboardingStore.getState();
    expect(selectCompletedStepsCount(state)).toBe(8);
    expect(selectOverallProgress(state)).toBe(100);
  });

  it('resets onboarding state completely with resetOnboarding', () => {
    const { setStepStatus, resetOnboarding } = useOnboardingStore.getState();
    setStepStatus('welcome', 'completed');
    expect(selectCompletedStepsCount(useOnboardingStore.getState())).toBe(1);

    resetOnboarding();
    expect(selectCompletedStepsCount(useOnboardingStore.getState())).toBe(0);
    expect(selectOverallProgress(useOnboardingStore.getState())).toBe(0);
  });
});
