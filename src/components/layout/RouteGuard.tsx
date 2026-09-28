import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingStore, isStepLocked } from '@/store/onboarding.store';
import { StepId } from '@/types';

export interface RouteGuardProps {
  stepId: StepId;
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ stepId, children }) => {
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const locked = isStepLocked(stepId, stepStatus);

  if (locked) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
