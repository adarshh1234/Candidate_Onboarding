import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignDialog } from '@/components/recruiter/AssignDialog';
import { RecruiterCandidate } from '@/types';

import { initialMockCandidates } from '@/mocks/recruiterCandidates';

const baseCandidate = initialMockCandidates[0]!;
const mockCandidate: RecruiterCandidate = {
  ...baseCandidate,
  buddyManager: {
    managerId: 'EMP-102',
    managerName: 'Vikram Patel',
    managerEmail: 'vikram.patel@apex.com',
  },
};

describe('Buddy & Manager Assignment Rules', () => {
  it('enforces buddy ≠ manager rule (manager cannot be selected as buddy)', () => {
    const handleAssign = vi.fn();

    render(
      <AssignDialog
        isOpen={true}
        onClose={vi.fn()}
        candidate={mockCandidate}
        assignmentType="buddy"
        onAssign={handleAssign}
      />
    );

    // Search for existing manager Vikram Patel
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Vikram Patel' } });

    // The manager's row should indicate conflict badge "Already Manager"
    expect(screen.getByText(/Already Manager/i)).toBeInTheDocument();

    // Clicking the conflicted manager should NOT select them
    const managerCard = screen.getByText('Vikram Patel').closest('div');
    if (managerCard) {
      fireEvent.click(managerCard);
    }

    // Confirm button should remain disabled
    const confirmBtn = screen.getByRole('button', { name: /Confirm Assignment/i });
    expect(confirmBtn).toBeDisabled();
    expect(handleAssign).not.toHaveBeenCalled();
  });

  it('displays warning badge when buddy has high load (>= 3 active buddies)', () => {
    render(
      <AssignDialog
        isOpen={true}
        onClose={vi.fn()}
        candidate={mockCandidate}
        assignmentType="buddy"
        onAssign={vi.fn()}
      />
    );

    // Priya Nair has currentBuddyCount: 3 in mock
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Priya Nair' } });

    // High buddy load warning should be visible
    expect(screen.getByText(/3 active buddies/i)).toBeInTheDocument();
  });

  it('allows selecting an eligible colleague and calls onAssign', () => {
    const handleAssign = vi.fn();

    render(
      <AssignDialog
        isOpen={true}
        onClose={vi.fn()}
        candidate={mockCandidate}
        assignmentType="buddy"
        onAssign={handleAssign}
      />
    );

    // Search for Sarah Jenkins (not current manager)
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Sarah Jenkins' } });

    const colleague = screen.getByText('Sarah Jenkins');
    fireEvent.click(colleague);

    const confirmBtn = screen.getByRole('button', { name: /Confirm Assignment/i });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);
    expect(handleAssign).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sarah Jenkins',
      })
    );
  });
});
