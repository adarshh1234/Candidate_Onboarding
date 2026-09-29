import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RequireAuth, RootRedirect } from '@/components/layout/RequireAuth';
import { RouteGuard } from '@/components/layout/RouteGuard';

// Auth Pages
import { LoginPage } from '@/features/auth/LoginPage';

// Candidate Portal Pages
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { WelcomePage } from '@/features/welcome/WelcomePage';
import { PersonalInfoPage } from '@/features/personal/PersonalInfoPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { BankTaxPage } from '@/features/bank/BankTaxPage';
import { PoliciesPage } from '@/features/policies/PoliciesPage';
import { TrainingPage } from '@/features/training/TrainingPage';
import { TeamPage } from '@/features/team/TeamPage';
import { ChecklistPage } from '@/features/checklist/ChecklistPage';

// Recruiter Portal Pages
import { FinalListPage } from '@/features/recruiter/final-list/FinalListPage';
import { BGVPage } from '@/features/recruiter/bgv/BGVPage';
import { AssessmentsPage } from '@/features/recruiter/assessments/AssessmentsPage';
import { OffersPage } from '@/features/recruiter/offers/OffersPage';
import { DocumentsReviewPage } from '@/features/recruiter/documents/DocumentsReviewPage';
import { ProvisionsPage } from '@/features/recruiter/provisions/ProvisionsPage';
import { BuddyManagerPage } from '@/features/recruiter/buddy-manager/BuddyManagerPage';
import { RecruiterTrainingPage } from '@/features/recruiter/training/RecruiterTrainingPage';
import { VisaPage } from '@/features/recruiter/visa/VisaPage';
import { InsurancePage } from '@/features/recruiter/insurance/InsurancePage';
import { MiscPage } from '@/features/recruiter/miscellaneous/MiscPage';
import { ReportsPage } from '@/features/recruiter/reports/ReportsPage';

export const router = createBrowserRouter([
  // Public Auth Route
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
  },

  // Root redirect based on auth status and role
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Candidate Portal Routes (Protected by role='candidate')
  {
    path: '/candidate',
    element: (
      <ErrorBoundary>
        <RequireAuth allowedRole="candidate">
          <AppShell />
        </RequireAuth>
      </ErrorBoundary>
    ),
    errorElement: (
      <ErrorBoundary>
        <Navigate to="/candidate" replace />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'personal',
        element: (
          <RouteGuard stepId="personal">
            <PersonalInfoPage />
          </RouteGuard>
        ),
      },
      {
        path: 'documents',
        element: (
          <RouteGuard stepId="documents">
            <DocumentsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'bank',
        element: (
          <RouteGuard stepId="bank">
            <BankTaxPage />
          </RouteGuard>
        ),
      },
      {
        path: 'policies',
        element: (
          <RouteGuard stepId="policies">
            <PoliciesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'training',
        element: (
          <RouteGuard stepId="training">
            <TrainingPage />
          </RouteGuard>
        ),
      },
      {
        path: 'team',
        element: (
          <RouteGuard stepId="team">
            <TeamPage />
          </RouteGuard>
        ),
      },
      {
        path: 'checklist',
        element: (
          <RouteGuard stepId="checklist">
            <ChecklistPage />
          </RouteGuard>
        ),
      },
    ],
  },

  // Recruiter Portal Routes (Protected by role='recruiter')
  {
    path: '/recruiter',
    element: (
      <ErrorBoundary>
        <RequireAuth allowedRole="recruiter">
          <RecruiterShell />
        </RequireAuth>
      </ErrorBoundary>
    ),
    errorElement: (
      <ErrorBoundary>
        <Navigate to="/recruiter/final-list" replace />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/recruiter/final-list" replace />,
      },
      {
        path: 'final-list',
        element: <FinalListPage />,
      },
      {
        path: 'background-verification',
        element: <BGVPage />,
      },
      {
        path: 'assessments',
        element: <AssessmentsPage />,
      },
      {
        path: 'offers',
        element: <OffersPage />,
      },
      {
        path: 'documents',
        element: <DocumentsReviewPage />,
      },
      {
        path: 'provisions',
        element: <ProvisionsPage />,
      },
      {
        path: 'buddy-manager',
        element: <BuddyManagerPage />,
      },
      {
        path: 'training',
        element: <RecruiterTrainingPage />,
      },
      {
        path: 'visa-immigration',
        element: <VisaPage />,
      },
      {
        path: 'insurance',
        element: <InsurancePage />,
      },
      {
        path: 'miscellaneous',
        element: <MiscPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
    ],
  },

  // Legacy direct step route compatibility redirects
  { path: '/welcome', element: <Navigate to="/candidate/welcome" replace /> },
  { path: '/personal', element: <Navigate to="/candidate/personal" replace /> },
  { path: '/documents', element: <Navigate to="/candidate/documents" replace /> },
  { path: '/bank', element: <Navigate to="/candidate/bank" replace /> },
  { path: '/policies', element: <Navigate to="/candidate/policies" replace /> },
  { path: '/training', element: <Navigate to="/candidate/training" replace /> },
  { path: '/team', element: <Navigate to="/candidate/team" replace /> },
  { path: '/checklist', element: <Navigate to="/candidate/checklist" replace /> },

  // Catch-all
  {
    path: '*',
    element: <RootRedirect />,
  },
]);
