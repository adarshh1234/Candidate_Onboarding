import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { isStepLocked, useOnboardingStore } from '@/store/onboarding.store';
import { RouteGuard } from '@/components/layout/RouteGuard';

describe('Route Guard & Locking Logic', () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding();
  });

  it('keeps welcome unlocked initially but locks step 2-8', () => {
    const { stepStatus } = useOnboardingStore.getState();

    expect(isStepLocked('welcome', stepStatus)).toBe(false);
    expect(isStepLocked('personal', stepStatus)).toBe(true);
    expect(isStepLocked('documents', stepStatus)).toBe(true);
    expect(isStepLocked('bank', stepStatus)).toBe(true);
    expect(isStepLocked('policies', stepStatus)).toBe(true);
    expect(isStepLocked('training', stepStatus)).toBe(true);
    expect(isStepLocked('team', stepStatus)).toBe(true);
    expect(isStepLocked('checklist', stepStatus)).toBe(true);
  });

  it('unlocks personal step once welcome step is completed', () => {
    const { setStepStatus } = useOnboardingStore.getState();
    setStepStatus('welcome', 'completed');

    const { stepStatus } = useOnboardingStore.getState();
    expect(isStepLocked('personal', stepStatus)).toBe(false);
    expect(isStepLocked('documents', stepStatus)).toBe(true);
  });

  it('unlocks downstream steps sequentially as prerequisites are met', () => {
    const { setStepStatus } = useOnboardingStore.getState();
    setStepStatus('welcome', 'completed');
    setStepStatus('personal', 'completed');

    let state = useOnboardingStore.getState();
    expect(isStepLocked('documents', state.stepStatus)).toBe(false);
    expect(isStepLocked('bank', state.stepStatus)).toBe(true);

    setStepStatus('documents', 'completed');
    state = useOnboardingStore.getState();
    expect(isStepLocked('bank', state.stepStatus)).toBe(false);
  });

  it('RouteGuard redirects locked steps away and renders unlocked steps', () => {
    // Test when step is unlocked
    const { setStepStatus } = useOnboardingStore.getState();
    setStepStatus('welcome', 'completed');

    render(
      <MemoryRouter initialEntries={['/personal']}>
        <Routes>
          <Route path="/" element={<div>Dashboard Home</div>} />
          <Route
            path="/personal"
            element={
              <RouteGuard stepId="personal">
                <div>Personal Information Form Content</div>
              </RouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Personal Information Form Content')).toBeInTheDocument();
  });

  it('RouteGuard redirects to / when step is locked', () => {
    // Reset to not_started
    useOnboardingStore.getState().resetOnboarding();

    render(
      <MemoryRouter initialEntries={['/personal']}>
        <Routes>
          <Route path="/" element={<div>Dashboard Home</div>} />
          <Route
            path="/personal"
            element={
              <RouteGuard stepId="personal">
                <div>Personal Form Content</div>
              </RouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    // Should redirect to root "/"
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
    expect(screen.queryByText('Personal Form Content')).not.toBeInTheDocument();
  });
});
