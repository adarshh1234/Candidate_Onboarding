import {
  ShieldCheck,
  HeartPulse,
  UserCheck,
  ShieldAlert,
  Users,
  Building2,
  LucideIcon,
} from 'lucide-react';

export type InsuranceTabId =
  | 'details'
  | 'medical'
  | 'employee'
  | 'accident'
  | 'family'
  | 'group';

export interface InsuranceTabConfig {
  id: InsuranceTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export const INSURANCE_TABS: InsuranceTabConfig[] = [
  {
    id: 'details',
    label: 'Insurance Details',
    shortLabel: 'Details',
    icon: ShieldCheck,
    description: 'Master overview of corporate insurance policies, enrollment statuses, and coverage tiers.',
  },
  {
    id: 'medical',
    label: 'Medical Insurance',
    shortLabel: 'Medical',
    icon: HeartPulse,
    description: 'Group Medical Coverage (GMC), hospitalization sum insured, cashless TPA networks, and OPD benefits.',
  },
  {
    id: 'employee',
    label: 'Employee Insurance',
    shortLabel: 'Employee',
    icon: UserCheck,
    description: 'Direct Group Term Life (GTL) assurance, employee life cover, nominees, and digital e-Card credentials.',
  },
  {
    id: 'accident',
    label: 'Accident Cover',
    shortLabel: 'Accident',
    icon: ShieldAlert,
    description: 'Group Personal Accident (GPA) protection, critical illness riders, and emergency trauma coverage.',
  },
  {
    id: 'family',
    label: 'Family Insurance',
    shortLabel: 'Family',
    icon: Users,
    description: 'Family floater coverage (Self, Spouse, Children, and Dependent Parents) with age validation.',
  },
  {
    id: 'group',
    label: 'Group Insurance',
    shortLabel: 'Group',
    icon: Building2,
    description: 'Corporate master policy agreements, insurer underwriters, premium allocation, and corporate endorsement.',
  },
];

export const DEFAULT_INSURANCE_TAB_ID: InsuranceTabId = 'details';

export const VALID_INSURANCE_TAB_IDS: InsuranceTabId[] = INSURANCE_TABS.map((t) => t.id);
