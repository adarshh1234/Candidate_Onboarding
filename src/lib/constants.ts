import { DocTypeConfig, StepId } from '@/types';

export const STEP_ORDER: StepId[] = [
  'welcome',
  'personal',
  'documents',
  'bank',
  'policies',
  'training',
  'team',
  'checklist',
];

export interface StepMeta {
  id: StepId;
  stepNumber: number;
  title: string;
  shortTitle: string;
  description: string;
  path: string;
  iconName: string;
  required: boolean;
  estimatedMinutes: number;
}

export const STEP_CONFIG: Record<StepId, StepMeta> = {
  welcome: {
    id: 'welcome',
    stepNumber: 1,
    title: 'Offer Acceptance',
    shortTitle: 'Offer Letter',
    description: 'Review and formally accept your employment offer and terms.',
    path: '/candidate/welcome',
    iconName: 'FileCheck',
    required: true,
    estimatedMinutes: 5,
  },
  personal: {
    id: 'personal',
    stepNumber: 2,
    title: 'Personal Information',
    shortTitle: 'Personal Info',
    description: 'Provide your contact details, residential address, and emergency contact.',
    path: '/candidate/personal',
    iconName: 'UserCheck',
    required: true,
    estimatedMinutes: 8,
  },
  documents: {
    id: 'documents',
    stepNumber: 3,
    title: 'Document Verification',
    shortTitle: 'Documents',
    description: 'Upload identification, academic credentials, and previous employment proofs.',
    path: '/candidate/documents',
    iconName: 'UploadCloud',
    required: true,
    estimatedMinutes: 10,
  },
  bank: {
    id: 'bank',
    stepNumber: 4,
    title: 'Bank & Tax Information',
    shortTitle: 'Bank & Tax',
    description: 'Submit salary disbursement account, PAN card, and tax declaration.',
    path: '/candidate/bank',
    iconName: 'CreditCard',
    required: true,
    estimatedMinutes: 6,
  },
  policies: {
    id: 'policies',
    stepNumber: 5,
    title: 'Company Policies',
    shortTitle: 'Policies',
    description: 'Read and acknowledge core security, compliance, and code of conduct policies.',
    path: '/candidate/policies',
    iconName: 'ShieldAlert',
    required: true,
    estimatedMinutes: 12,
  },
  training: {
    id: 'training',
    stepNumber: 6,
    title: 'Onboarding Modules',
    shortTitle: 'Training',
    description: 'Watch introductory orientation videos and foundational security training.',
    path: '/candidate/training',
    iconName: 'GraduationCap',
    required: false,
    estimatedMinutes: 20,
  },
  team: {
    id: 'team',
    stepNumber: 7,
    title: 'Meet Your Team',
    shortTitle: 'Team',
    description: 'Discover your teammates, learn their roles, and schedule introductory 1:1s.',
    path: '/candidate/team',
    iconName: 'Users',
    required: false,
    estimatedMinutes: 5,
  },
  checklist: {
    id: 'checklist',
    stepNumber: 8,
    title: 'Day-1 Readiness Checklist',
    shortTitle: 'Day-1 Checklist',
    description: 'Track equipment delivery, access credentials, and finish final submission.',
    path: '/candidate/checklist',
    iconName: 'ListChecks',
    required: true,
    estimatedMinutes: 5,
  },
};

export const RECRUITER_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Data & AI',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance & Legal',
] as const;

export const RECRUITER_LOCATIONS = [
  'Bengaluru, India',
  'Hyderabad, India',
  'Pune, India',
  'Mumbai, India',
  'Delhi NCR, India',
  'Remote (India)',
  'Singapore',
  'London, UK',
] as const;

export const BGV_VENDORS = [
  'AuthBridge',
  'First Advantage',
  'Kroll Verification',
  'Sterling Talent Solutions',
] as const;

export const RECRUITER_SIDEBAR_ITEMS = [
  { label: 'Final List', path: '/recruiter/final-list', icon: 'Users2', badgeKey: 'total' },
  { label: 'Background Verification', path: '/recruiter/background-verification', icon: 'ShieldCheck', badgeKey: 'bgvPending' },
  { label: 'Assessments', path: '/recruiter/assessments', icon: 'CheckSquare', badgeKey: 'assessments' },
  { label: 'Offers', path: '/recruiter/offers', icon: 'FileSignature', badgeKey: 'offersPending' },
  { label: 'Documents', path: '/recruiter/documents', icon: 'FolderCheck', badgeKey: 'docsPending' },
  { label: 'Provisions', path: '/recruiter/provisions', icon: 'Laptop', badgeKey: 'provisions' },
  { label: 'Buddy/Direct Manager', path: '/recruiter/buddy-manager', icon: 'UserCheck', badgeKey: 'unassignedBuddy' },
  { label: 'Training', path: '/recruiter/training', icon: 'GraduationCap', badgeKey: 'training' },
  { label: 'Visa & Immigration', path: '/recruiter/visa-immigration', icon: 'Globe', badgeKey: 'visaCases' },
  { label: 'Insurance', path: '/recruiter/insurance', icon: 'HeartPulse', badgeKey: 'insurance' },
  { label: 'Other Miscellaneous', path: '/recruiter/miscellaneous', icon: 'Boxes', badgeKey: 'misc' },
  { label: 'Reports', path: '/recruiter/reports', icon: 'BarChart3', badgeKey: 'reports' },
] as const;

export const DOC_CONFIGS: DocTypeConfig[] = [
  {
    id: 'govt_id',
    title: 'Government Photo ID',
    description: 'Aadhaar Card, Passport, or Voter ID (Front & Back)',
    required: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 5,
  },
  {
    id: 'photo',
    title: 'Passport Size Photograph',
    description: 'Recent clear photograph with light background for company ID badge',
    required: true,
    acceptedFormats: ['image/jpeg', 'image/png'],
    maxSizeMB: 3,
  },
  {
    id: 'degree',
    title: 'Degree Certificate / Convocation',
    description: 'Highest educational qualification certificate or consolidated marksheets',
    required: true,
    acceptedFormats: ['application/pdf'],
    maxSizeMB: 10,
  },
  {
    id: 'experience',
    title: 'Experience & Relieving Letters',
    description: 'Service certificates and relieving letters from previous employer',
    required: true,
    acceptedFormats: ['application/pdf'],
    maxSizeMB: 10,
  },
  {
    id: 'payslips',
    title: 'Recent Payslips (Optional)',
    description: 'Last 3 consecutive months salary slips from previous organization',
    required: false,
    acceptedFormats: ['application/pdf'],
    maxSizeMB: 10,
  },
  {
    id: 'medical',
    title: 'Medical Fitness Certificate (Optional)',
    description: 'Basic health assessment signed by a registered medical practitioner',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeMB: 5,
  },
];

export const OFFER_DETAILS = {
  role: 'Senior Frontend Engineer',
  department: 'Product Engineering',
  band: 'L5 - Senior IC',
  joiningDate: 'October 15, 2026',
  workLocation: 'Bengaluru, India (Hybrid)',
  annualCTC: '₹34,50,000 INR',
  joiningBonus: '₹3,00,000 INR (1st month)',
  equityGrant: '1,200 Stock Options (4-year vesting, 1-year cliff)',
  probationPeriod: '3 Months',
  reportingManager: 'Sarah Jenkins (VP of Engineering)',
};
