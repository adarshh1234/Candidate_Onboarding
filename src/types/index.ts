export type StepId =
  | 'welcome'
  | 'personal'
  | 'documents'
  | 'bank'
  | 'policies'
  | 'training'
  | 'team'
  | 'checklist';

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface Manager {
  name: string;
  role: string;
  email: string;
  avatar: string;
  slackHandle?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  team: string;
  company: string;
  startDate: string; // ISO date YYYY-MM-DD
  manager: Manager;
  avatar?: string;
  location: string;
}

export interface Task {
  id: string;
  stepId: StepId;
  stepNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: StepStatus;
  iconName: string;
  path: string;
  required: boolean;
}

export type DocType =
  | 'govt_id'
  | 'photo'
  | 'degree'
  | 'experience'
  | 'payslips'
  | 'medical';

export interface DocTypeConfig {
  id: DocType;
  title: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
}

export interface UploadedDoc {
  id: string;
  type: DocType;
  name: string;
  size: number; // in bytes
  mimeType: string;
  uploadedAt: string; // ISO date
  previewUrl?: string; // object URL for in-memory preview
}

export interface Policy {
  id: string;
  title: string;
  category: 'Security' | 'Code of Conduct' | 'Privacy' | 'Workplace' | 'Remote Work' | 'Compliance';
  readingTime: string;
  summary: string;
  content: string[];
  version: string;
  effectiveDate: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number; // 0 to 100
  isCompleted: boolean;
  videoDurationSeconds: number;
  keyTopics: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  linkedinUrl: string;
  isManager?: boolean;
  scheduledMeeting?: {
    date: string;
    time: string;
    topic: string;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'HR' | 'IT' | 'Team' | 'Workspace';
  isVirtual: boolean;
  isCompleted: boolean;
  dueDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 10:30 AM"
  type: 'meeting' | 'training' | 'deadline' | 'social';
  organizer: string;
  locationOrUrl: string;
}

export interface PersonalInfoFormValues {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

export interface BankTaxFormValues {
  accountHolder: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: 'Savings' | 'Current';
  panNumber: string;
  uanNumber?: string;
  taxRegime: 'New Regime' | 'Old Regime';
}

export interface StepProgressState {
  welcome: StepStatus;
  personal: StepStatus;
  documents: StepStatus;
  bank: StepStatus;
  policies: StepStatus;
  training: StepStatus;
  team: StepStatus;
  checklist: StepStatus;
}
