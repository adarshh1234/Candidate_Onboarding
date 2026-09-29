import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { RequireAuth, RootRedirect } from '@/components/layout/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';

describe('Auth Store & Role-Based Route Guards', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('unauthenticated user is redirected to /login', () => {
    render(
      <MemoryRouter initialEntries={['/candidate']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route
            path="/candidate"
            element={
              <RequireAuth allowedRole="candidate">
                <div>Candidate Dashboard Screen</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
    expect(screen.queryByText('Candidate Dashboard Screen')).not.toBeInTheDocument();
  });

  it('candidate attempting to access recruiter portal is redirected to /candidate', () => {
    useAuthStore.setState({
      user: {
        id: 'CAND-001',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@email.com',
        role: 'candidate',
      },
      role: 'candidate',
    });

    render(
      <MemoryRouter initialEntries={['/recruiter/final-list']}>
        <Routes>
          <Route path="/candidate" element={<div>Candidate Home Screen</div>} />
          <Route
            path="/recruiter/final-list"
            element={
              <RequireAuth allowedRole="recruiter">
                <div>Recruiter Final List Screen</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Candidate Home Screen')).toBeInTheDocument();
    expect(screen.queryByText('Recruiter Final List Screen')).not.toBeInTheDocument();
  });

  it('recruiter attempting to access candidate portal is redirected to /recruiter/final-list', () => {
    useAuthStore.setState({
      user: {
        id: 'REC-001',
        name: 'Priya Nair',
        email: 'recruiter@apex.com',
        role: 'recruiter',
      },
      role: 'recruiter',
    });

    render(
      <MemoryRouter initialEntries={['/candidate/welcome']}>
        <Routes>
          <Route path="/recruiter/final-list" element={<div>Recruiter Final List Screen</div>} />
          <Route
            path="/candidate/welcome"
            element={
              <RequireAuth allowedRole="candidate">
                <div>Candidate Welcome Screen</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Recruiter Final List Screen')).toBeInTheDocument();
    expect(screen.queryByText('Candidate Welcome Screen')).not.toBeInTheDocument();
  });

  it('RootRedirect routes correctly according to role', () => {
    // 1. Unauthenticated -> /login
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<div>Redirected Login</div>} />
          <Route path="/candidate" element={<div>Redirected Candidate</div>} />
          <Route path="/recruiter/final-list" element={<div>Redirected Recruiter</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Redirected Login')).toBeInTheDocument();
    unmount();

    // 2. Candidate -> /candidate
    useAuthStore.setState({
      user: { id: '1', name: 'Aarav', email: 'aarav@test.com', role: 'candidate' },
      role: 'candidate',
    });
    const { unmount: unmount2 } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/candidate" element={<div>Redirected Candidate</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Redirected Candidate')).toBeInTheDocument();
    unmount2();

    // 3. Recruiter -> /recruiter/final-list
    useAuthStore.setState({
      user: { id: '2', name: 'Priya', email: 'recruiter@test.com', role: 'recruiter' },
      role: 'recruiter',
    });
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/recruiter/final-list" element={<div>Redirected Recruiter</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Redirected Recruiter')).toBeInTheDocument();
  });
});

describe('LoginPage Role Toggle & Demo Autofill', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('switches role toggle and updates form headings and helper hints', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Initial role is Candidate
    expect(screen.getByText('Welcome back, Candidate')).toBeInTheDocument();
    expect(
      screen.getByText(/Start Your Career Journey on Day 1/i)
    ).toBeInTheDocument();

    // Click the segmented toggle button for 'Recruiter'
    const recruiterButtons = screen.getAllByRole('button', { name: /Recruiter/i });
    expect(recruiterButtons[0]).toBeDefined();
    fireEvent.click(recruiterButtons[0]!);

    // Expect heading to switch to Recruiter Portal Access
    expect(screen.getByText('Recruiter Portal Access')).toBeInTheDocument();
    expect(
      screen.getByText(/Candidate Pipelines & Readiness at Scale/i)
    ).toBeInTheDocument();
  });

  it('autofills candidate demo credentials on button click', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Click demo credentials autofill for candidate
    const fillBtn = screen.getByText('aarav.sharma@email.com');
    fireEvent.click(fillBtn);

    const emailInput = screen.getByPlaceholderText('name@company.com') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

    expect(emailInput.value).toBe('aarav.sharma@email.com');
    expect(passwordInput.value).toBe('Demo@1234');
  });

  it('autofills recruiter demo credentials on button click', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Click demo credentials autofill for recruiter
    const fillBtn = screen.getByText('recruiter@apex.com');
    fireEvent.click(fillBtn);

    const emailInput = screen.getByPlaceholderText('name@company.com') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

    expect(emailInput.value).toBe('recruiter@apex.com');
    expect(passwordInput.value).toBe('Demo@1234');
  });
});
