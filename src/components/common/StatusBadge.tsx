import React from 'react';
import { StepStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react';

export interface StatusBadgeProps {
  status: StepStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" size={size}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="warning" size={size}>
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
        </Badge>
      );
    case 'not_started':
    default:
      return (
        <Badge variant="default" size={size}>
          <CircleDot className="w-3.5 h-3.5 opacity-60" />
          <span>Not Started</span>
        </Badge>
      );
  }
};
