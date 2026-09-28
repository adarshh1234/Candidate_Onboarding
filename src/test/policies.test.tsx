import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useOnboardingStore } from '@/store/onboarding.store';
import { PoliciesPage } from '@/features/policies/PoliciesPage';
import { mockPolicies } from '@/mocks/policies';

describe('PoliciesPage & Continue-Gating', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingStore.getState().resetOnboarding();
    });
  });

  it('renders all 6 policy cards initially', () => {
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    mockPolicies.forEach((policy) => {
      expect(screen.getByText(policy.title)).toBeInTheDocument();
    });
  });

  it('disables Acknowledge checkboxes until a policy is marked as read', () => {
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // All 6 checkboxes should be disabled initially
    checkboxes.forEach((cb) => {
      expect(cb).toBeDisabled();
    });
  });

  it('disables "Acknowledge All" button until all policies are marked as read', () => {
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    const ackAllBtn = screen.getByRole('button', { name: /Acknowledge All/i });
    expect(ackAllBtn).toBeDisabled();

    // Mark all policies as read in store
    act(() => {
      const { markPolicyAsRead } = useOnboardingStore.getState();
      mockPolicies.forEach((p) => markPolicyAsRead(p.id));
    });

    // Re-render
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    const updatedAckAllBtns = screen.getAllByRole('button', { name: /Acknowledge All/i });
    const activeAckAllBtn = updatedAckAllBtns[updatedAckAllBtns.length - 1];
    expect(activeAckAllBtn).not.toBeDisabled();
  });

  it('disables Continue button until all policies have been acknowledged', () => {
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    const continueBtn = screen.getByRole('button', { name: /Continue to Training Modules/i });
    expect(continueBtn).toBeDisabled();

    // Now acknowledge all policies
    act(() => {
      const { acknowledgeAllPolicies } = useOnboardingStore.getState();
      acknowledgeAllPolicies();
    });

    // Re-render
    render(
      <MemoryRouter>
        <PoliciesPage />
      </MemoryRouter>,
    );

    const enabledContinueBtns = screen.getAllByRole('button', {
      name: /Continue to Training Modules/i,
    });
    const lastContinueBtn = enabledContinueBtns[enabledContinueBtns.length - 1];
    expect(lastContinueBtn).not.toBeDisabled();
  });
});

