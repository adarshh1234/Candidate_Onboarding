import {
  Building2,
  UserCheck,
  Users2,
  ShieldAlert,
  LucideIcon,
} from 'lucide-react';

export type BuddyManagerTabId =
  | 'department'
  | 'reporting_to'
  | 'team_head'
  | 'dept_head';

export interface BuddyManagerTabConfig {
  id: BuddyManagerTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export const BUDDY_MANAGER_TABS: BuddyManagerTabConfig[] = [
  {
    id: 'department',
    label: 'Department',
    shortLabel: 'Department',
    icon: Building2,
    description: 'Organizational department view with dedicated mentorship pairing matrices and department health.',
  },
  {
    id: 'reporting_to',
    label: 'Reporting to',
    shortLabel: 'Reporting to',
    icon: UserCheck,
    description: 'Direct manager reporting lines, 1-on-1 mentorship structures, and management load distribution.',
  },
  {
    id: 'team_head',
    label: 'Team & Team Head',
    shortLabel: 'Team & Head',
    icon: Users2,
    description: 'Functional squads, agile teams, and assigned Team Leads / Engineering Leads oversee onboarding joiners.',
  },
  {
    id: 'dept_head',
    label: 'In charge of department',
    shortLabel: 'Dept Head In-Charge',
    icon: ShieldAlert,
    description: 'Executive Division Heads and VPs in charge of departments with executive oversight of onboarding pipelines.',
  },
];

export const DEFAULT_BUDDY_TAB_ID: BuddyManagerTabId = 'department';

export const VALID_BUDDY_TAB_IDS: BuddyManagerTabId[] = BUDDY_MANAGER_TABS.map((t) => t.id);

export interface DepartmentHeadInfo {
  department: string;
  headName: string;
  headTitle: string;
  headEmail: string;
  headAvatar: string;
  totalTeams: number;
  activeSquads: string[];
  defaultBuddyPolicy: string;
}

export const DEPARTMENT_HEADS_DIRECTORY: Record<string, DepartmentHeadInfo> = {
  Engineering: {
    department: 'Engineering',
    headName: 'Sarah Jenkins',
    headTitle: 'VP of Engineering',
    headEmail: 'sarah.jenkins@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalTeams: 5,
    activeSquads: ['Core Architecture', 'Frontend Platform', 'Cloud Infrastructure', 'Mobile Core', 'API Services'],
    defaultBuddyPolicy: 'Staff/Senior Engineer from adjoining squad',
  },
  Product: {
    department: 'Product',
    headName: 'Marcus Chen',
    headTitle: 'Director of Product Management',
    headEmail: 'marcus.chen@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalTeams: 3,
    activeSquads: ['Enterprise Growth', 'Candidate Experience Pod', 'Platform Monetization'],
    defaultBuddyPolicy: 'Cross-functional Lead PM or Senior Designer',
  },
  Design: {
    department: 'Design',
    headName: 'Elena Rostova',
    headTitle: 'Principal Product Designer & Head of Design',
    headEmail: 'elena.rostova@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalTeams: 2,
    activeSquads: ['Design System Guild', 'Product UX Research Team'],
    defaultBuddyPolicy: 'Design System Lead or Senior UX Researcher',
  },
  Sales: {
    department: 'Sales',
    headName: 'Amitabh Roy',
    headTitle: 'VP of Global Enterprise Sales',
    headEmail: 'amitabh.roy@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    totalTeams: 3,
    activeSquads: ['APAC Enterprise Sales', 'EMEA Accounts', 'Solutions Engineering'],
    defaultBuddyPolicy: 'Senior Account Executive',
  },
  'Human Resources': {
    department: 'Human Resources',
    headName: 'Priya Nair',
    headTitle: 'Lead Talent Partner & Head of People',
    headEmail: 'priya.nair@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    totalTeams: 2,
    activeSquads: ['Talent Acquisition Squad', 'People Operations & Culture'],
    defaultBuddyPolicy: 'Senior People Partner',
  },
  'Data & AI': {
    department: 'Data & AI',
    headName: 'Neha Verma',
    headTitle: 'Senior Director of Data Science & AI',
    headEmail: 'neha.verma@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    totalTeams: 3,
    activeSquads: ['ML Platform Services', 'Analytics & Insights Pod', 'LLM Engineering'],
    defaultBuddyPolicy: 'Lead Data Scientist',
  },
  Marketing: {
    department: 'Marketing',
    headName: 'Rachel Green',
    headTitle: 'Head of Brand & Growth Marketing',
    headEmail: 'rachel.green@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalTeams: 2,
    activeSquads: ['Content & Communications', 'Performance Marketing'],
    defaultBuddyPolicy: 'Senior Growth Manager',
  },
  Finance: {
    department: 'Finance',
    headName: 'David Sterling',
    headTitle: 'Chief Financial Officer & VP Finance',
    headEmail: 'david.sterling@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    totalTeams: 2,
    activeSquads: ['Financial Planning & Analysis', 'Corporate Accounting & Treasury'],
    defaultBuddyPolicy: 'Finance Controller',
  },
  Operations: {
    department: 'Operations',
    headName: 'Siddharth Rao',
    headTitle: 'VP of Global Operations & Infrastructure',
    headEmail: 'siddharth.rao@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalTeams: 3,
    activeSquads: ['Workplace & Real Estate', 'IT Support & Security Ops', 'Procurement'],
    defaultBuddyPolicy: 'Lead Operations Manager',
  },
  Legal: {
    department: 'Legal',
    headName: 'Meera Deshpande',
    headTitle: 'General Counsel & Head of Legal',
    headEmail: 'meera.deshpande@apex.com',
    headAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalTeams: 1,
    activeSquads: ['Corporate Governance & Privacy'],
    defaultBuddyPolicy: 'Senior Corporate Counsel',
  },
};
