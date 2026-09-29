import {
  Globe2,
  FileText,
  Calendar,
  FolderCheck,
  DollarSign,
  LucideIcon,
} from 'lucide-react';

export type VisaTabId =
  | 'status'
  | 'details'
  | 'expiry'
  | 'documents'
  | 'cost';

export interface VisaTabConfig {
  id: VisaTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export const VISA_TABS: VisaTabConfig[] = [
  {
    id: 'status',
    label: 'Visa Status',
    shortLabel: 'Status',
    icon: Globe2,
    description: 'Immigration pipeline tracker, active filing stages, and relocation readiness.',
  },
  {
    id: 'details',
    label: 'Visa Details',
    shortLabel: 'Details',
    icon: FileText,
    description: 'Visa specifications, case reference numbers, sponsoring entities, and legal counsel.',
  },
  {
    id: 'expiry',
    label: 'Visa Expiry',
    shortLabel: 'Expiry',
    icon: Calendar,
    description: 'Expiration monitoring, 90-day renewal windows, and passport validity tracking.',
  },
  {
    id: 'documents',
    label: 'Documents',
    shortLabel: 'Documents',
    icon: FolderCheck,
    description: 'Immigration documentation checklists, apostilled certificates, and petitions.',
  },
  {
    id: 'cost',
    label: 'Cost',
    shortLabel: 'Cost',
    icon: DollarSign,
    description: 'Immigration filing fees, attorney invoices, relocation grants, and travel expenditure.',
  },
];

export const DEFAULT_VISA_TAB_ID: VisaTabId = 'status';

export const VALID_VISA_TAB_IDS: VisaTabId[] = VISA_TABS.map((t) => t.id);
