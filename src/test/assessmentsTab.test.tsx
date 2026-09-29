import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, Location } from 'react-router-dom';
import { AssessmentsPage } from '@/features/recruiter/assessments/AssessmentsPage';
import { RecruiterSidebar } from '@/components/recruiter/RecruiterSidebar';
import { AssignAssessmentDialog } from '@/features/recruiter/assessments/components/AssignAssessmentDialog';
import { TechnicalEvaluateDialog } from '@/features/recruiter/assessments/components/EvaluateDialog/TechnicalEvaluateDialog';
import { LanguageEvaluateDialog } from '@/features/recruiter/assessments/components/EvaluateDialog/LanguageEvaluateDialog';
import { useHiringStore } from '@/store/hiring.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { AssessmentFlatRow } from '@/features/recruiter/assessments/hooks';
import { CandidateAssessment } from '@/types';

// Helper component to track URL changes in tests
const LocationTracker = ({ onLocationChange }: { onLocationChange: (loc: Location) => void }) => {
  const location = useLocation();
  React.useEffect(() => {
    onLocationChange(location);
  }, [location, onLocationChange]);
  return null;
};

const renderWithRouter = (initialEntries: string[] = ['/recruiter/assessments']) => {
  let currentLocation = {} as Location;
  const utils = render(
    <MemoryRouter initialEntries={initialEntries}>
      <LocationTracker onLocationChange={(loc) => { currentLocation = loc; }} />
      <Routes>
        <Route path="/recruiter/assessments" element={<AssessmentsPage />} />
      </Routes>
    </MemoryRouter>
  );

  return {
    ...utils,
    getLocation: () => currentLocation,
  };
};

describe('Recruiter Assessments Tabbed Feature', () => {
  beforeEach(() => {
    useHiringStore.getState().resetDemo();
    useOnboardingStore.setState({ notifications: [] });
  });

  it('renders 5 tabs with exact labels, and sidebar has single "Assessments" entry', () => {
    // Check Sidebar first
    const { unmount } = render(
      <MemoryRouter initialEntries={['/recruiter/assessments']}>
        <RecruiterSidebar />
      </MemoryRouter>
    );

    const sidebarLinks = screen.getAllByRole('link', { name: /assessments/i });
    expect(sidebarLinks.length).toBe(1);
    expect(sidebarLinks[0]).toHaveTextContent('Assessments');
    unmount();

    // Check AssessmentsPage tabs
    renderWithRouter(['/recruiter/assessments']);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(5);

    expect(tabs[0]).toHaveTextContent('Psychometric Tests');
    expect(tabs[1]).toHaveTextContent('Language + Communication Assessment');
    expect(tabs[2]).toHaveTextContent('Performance Assessment');
    expect(tabs[3]).toHaveTextContent('Technical Assessment');
    expect(tabs[4]).toHaveTextContent('AT Assessment');
  });

  it('URL ?tab=technical selects Technical; invalid falls back to psychometric; clicking tab updates URL', async () => {
    // 1. Deep link with ?tab=technical
    const { unmount: unmount1 } = renderWithRouter(['/recruiter/assessments?tab=technical']);
    const technicalTab = screen.getByRole('tab', { name: /Technical Assessment/i });
    expect(technicalTab).toHaveAttribute('aria-selected', 'true');
    unmount1();

    // 2. Invalid tab value falls back to default 'psychometric'
    const { unmount: unmount2 } = renderWithRouter(['/recruiter/assessments?tab=nonexistent_invalid_track']);
    const psychometricTab = screen.getByRole('tab', { name: /Psychometric Tests/i });
    expect(psychometricTab).toHaveAttribute('aria-selected', 'true');
    unmount2();

    // 3. Clicking tab updates URL query
    const { getLocation } = renderWithRouter(['/recruiter/assessments']);
    const languageTab = screen.getByRole('tab', { name: /Language \+ Communication Assessment/i });
    fireEvent.click(languageTab);

    await waitFor(() => {
      expect(getLocation().search).toContain('tab=language');
    });
  });

  it('supports arrow-key navigation between tabs', async () => {
    renderWithRouter(['/recruiter/assessments']);

    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0]!;
    firstTab.focus();
    expect(document.activeElement).toBe(firstTab);

    // Press ArrowRight to move to 2nd tab (Language)
    fireEvent.keyDown(firstTab, { key: 'ArrowRight', code: 'ArrowRight' });
    await waitFor(() => {
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    // Press ArrowRight to move to 3rd tab (Performance)
    fireEvent.keyDown(tabs[1]!, { key: 'ArrowRight', code: 'ArrowRight' });
    await waitFor(() => {
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    });

    // Press Home to jump to 1st tab
    fireEvent.keyDown(tabs[2]!, { key: 'Home', code: 'Home' });
    await waitFor(() => {
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('Assign dialog blocks due date after start date (warning) and past dates (error)', async () => {
    const candidate = useHiringStore.getState().candidates[0]!;

    render(
      <AssignAssessmentDialog
        isOpen={true}
        onClose={vi.fn()}
        initialType="technical"
      />
    );

    // Select candidate
    const candidateRow = screen.getByText(candidate.name);
    fireEvent.click(candidateRow);

    const dueDateInput = screen.getByLabelText(/Target Due Date/i);

    // 1. Past date -> Error message displayed
    fireEvent.change(dueDateInput, { target: { value: '2020-01-01' } });
    await waitFor(() => {
      expect(screen.getByText(/Due date cannot be in the past/i)).toBeInTheDocument();
    });

    // 2. Due date after candidate start date -> Warning message displayed
    // Candidate starts at 2026-10-15 (or cand.startDate). Let's set 2030-01-01 which is strictly after startDate
    fireEvent.change(dueDateInput, { target: { value: '2030-01-01' } });
    await waitFor(() => {
      expect(screen.getByText(/is after candidate start date/i)).toBeInTheDocument();
    });

    // The submit button is disabled when blocked by warning/error
    const submitBtn = screen.getByRole('button', { name: /Assign Assessment/i });
    expect(submitBtn).toBeDisabled();
  });

  it('Technical evaluate auto-suggests Pass/Fail from passMark', async () => {
    const mockAssessment: AssessmentFlatRow = {
      id: 'asm-tech-test',
      candidateId: 'CAND-001',
      candidateName: 'Aarav Sharma',
      candidateEmail: 'aarav.sharma@email.com',
      candidateAvatar: 'AS',
      department: 'Engineering',
      role: 'Senior Frontend Engineer',
      title: 'Full Stack Challenge',
      type: 'technical',
      assignedAt: '2026-09-20',
      dueAt: '2026-10-10',
      status: 'submitted',
      maxScore: 100,
      passMark: 70,
      meta: {
        track: 'Backend',
        format: 'Live Coding',
        platform: 'CoderPad',
        sections: [
          { name: 'DSA', score: 40, maxScore: 50 },
          { name: 'System Design', score: 35, maxScore: 50 },
        ], // 75/100 = 75% >= 70% -> auto-suggest 'pass'
      },
      isOverdue: false,
      candidateRef: useHiringStore.getState().candidates[0]!,
      rawAssessment: {} as CandidateAssessment,
    };

    const { unmount } = render(
      <TechnicalEvaluateDialog
        isOpen={true}
        onClose={vi.fn()}
        assessment={mockAssessment}
        onSubmit={vi.fn()}
      />
    );

    // With 75% earned and passMark 70, result select should auto-suggest "pass"
    const resultSelect = screen.getByRole('combobox');
    expect(resultSelect).toHaveValue('pass');
    expect(screen.getByText(/Meets Pass Requirement/i)).toBeInTheDocument();
    unmount();

    // Now test failing scenario (score below passMark)
    const failingAssessment: AssessmentFlatRow = {
      ...mockAssessment,
      meta: {
        ...mockAssessment.meta,
        sections: [
          { name: 'DSA', score: 20, maxScore: 50 },
          { name: 'System Design', score: 20, maxScore: 50 },
        ], // 40/100 = 40% < 70% -> auto-suggest 'fail'
      },
    };

    render(
      <TechnicalEvaluateDialog
        isOpen={true}
        onClose={vi.fn()}
        assessment={failingAssessment}
        onSubmit={vi.fn()}
      />
    );

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('fail');
      expect(screen.getByText(/Below Benchmark/i)).toBeInTheDocument();
    });
  });

  it('Language overall score = weighted average of module scores', async () => {
    const mockAssessment: AssessmentFlatRow = {
      id: 'asm-lang-test',
      candidateId: 'CAND-001',
      candidateName: 'Aarav Sharma',
      candidateEmail: 'aarav.sharma@email.com',
      candidateAvatar: 'AS',
      department: 'Engineering',
      role: 'Senior Frontend Engineer',
      title: 'Business English Evaluation',
      type: 'language',
      assignedAt: '2026-09-20',
      dueAt: '2026-10-10',
      status: 'submitted',
      maxScore: 100,
      passMark: 70,
      meta: {
        language: 'English',
        modules: {
          reading: 80,
          writing: 90,
          listening: 70,
          speaking: 80,
        }, // (80 + 90 + 70 + 80) / 4 = 80
      },
      isOverdue: false,
      candidateRef: useHiringStore.getState().candidates[0]!,
      rawAssessment: {} as CandidateAssessment,
    };

    render(
      <LanguageEvaluateDialog
        isOpen={true}
        onClose={vi.fn()}
        assessment={mockAssessment}
        onSubmit={vi.fn()}
      />
    );

    // Live weighted score displayed
    expect(screen.getByText('80 / 100')).toBeInTheDocument();

    // Adjust reading score to 100 -> new avg: (100 + 90 + 70 + 80) / 4 = 85
    const readingInput = screen.getAllByRole('spinbutton')[0]!;
    fireEvent.change(readingInput, { target: { value: '100' } });

    await waitFor(() => {
      expect(screen.getByText('85 / 100')).toBeInTheDocument();
    });
  });

  it('Evaluating updates store + writes activity log + candidate notification', async () => {
    const candidateId = 'CAND-001';
    const store = useHiringStore.getState();
    const candidate = store.candidates.find((c) => c.id === candidateId);
    expect(candidate).toBeDefined();

    // Find or ensure an assessment exists
    let asm = candidate?.assessments?.find((a) => a.type === 'technical');
    if (!asm) {
      store.assignAssessment([candidateId], {
        type: 'technical',
        title: 'Senior Coding Battery',
        dueAt: '2026-10-15',
        passMark: 70,
      });
      asm = useHiringStore.getState().candidates.find((c) => c.id === candidateId)?.assessments?.[0];
    }
    expect(asm).toBeDefined();

    const asmId = asm!.id;

    // Evaluate assessment
    store.evaluateAssessment(candidateId, asmId, {
      score: 92,
      result: 'pass',
      remarks: 'Outstanding performance across system architecture.',
    });

    // 1. Candidate's assessment in store is updated
    const updatedCand = useHiringStore.getState().candidates.find((c) => c.id === candidateId);
    const updatedAsm = updatedCand?.assessments?.find((a) => a.id === asmId);
    expect(updatedAsm?.status).toBe('evaluated');
    expect(updatedAsm?.score).toBe(92);
    expect(updatedAsm?.result).toBe('pass');

    // 2. Activity log has entry
    const log = useHiringStore.getState().activityLog.find(
      (l) => l.candidateId === candidateId && l.action.includes('Evaluated')
    );
    expect(log?.details).toContain('Score: 92');
    expect(log?.details).toContain('pass');

    // 3. Candidate notification is created in onboarding store
    const notifs = useOnboardingStore.getState().notifications;
    const notif = notifs.find((n) => n.title.includes('Results Released'));
    expect(notif).toBeDefined();
    expect(notif?.description).toContain('Score: 92');
  });
});
