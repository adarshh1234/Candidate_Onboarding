import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoadingSkeleton } from '@/components/common/LoadingSkeleton';

// Lazy-loaded pages
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const WelcomePage = lazy(() =>
  import('@/features/welcome/WelcomePage').then((m) => ({ default: m.WelcomePage })),
);
const PersonalInfoPage = lazy(() =>
  import('@/features/personal/PersonalInfoPage').then((m) => ({ default: m.PersonalInfoPage })),
);
const DocumentsPage = lazy(() =>
  import('@/features/documents/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
);
const BankTaxPage = lazy(() =>
  import('@/features/bank/BankTaxPage').then((m) => ({ default: m.BankTaxPage })),
);
const PoliciesPage = lazy(() =>
  import('@/features/policies/PoliciesPage').then((m) => ({ default: m.PoliciesPage })),
);
const TrainingPage = lazy(() =>
  import('@/features/training/TrainingPage').then((m) => ({ default: m.TrainingPage })),
);
const TeamPage = lazy(() =>
  import('@/features/team/TeamPage').then((m) => ({ default: m.TeamPage })),
);
const ChecklistPage = lazy(() =>
  import('@/features/checklist/ChecklistPage').then((m) => ({ default: m.ChecklistPage })),
);

import { RouteGuard } from '@/components/layout/RouteGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    ),
    errorElement: (
      <ErrorBoundary>
        <Navigate to="/" replace />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'welcome',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <WelcomePage />
          </Suspense>
        ),
      },
      {
        path: 'personal',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="personal">
              <PersonalInfoPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'documents',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="documents">
              <DocumentsPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'bank',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="bank">
              <BankTaxPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'policies',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="policies">
              <PoliciesPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'training',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="training">
              <TrainingPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'team',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="team">
              <TeamPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: 'checklist',
        element: (
          <Suspense fallback={<PageLoadingSkeleton />}>
            <RouteGuard stepId="checklist">
              <ChecklistPage />
            </RouteGuard>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
