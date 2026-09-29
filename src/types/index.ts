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
  status?: 'pending_review' | 'verified' | 'rejected' | 'missing';
  rejectionReason?: string;
  reviewedAt?: string;
  verifiedAt?: string;
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

// ==========================================
// AUTH & RECRUITER PORTAL TYPES
// ==========================================

export type UserRole = 'candidate' | 'recruiter';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type CandidateStage =
  | 'Selected'
  | 'Offer Pending'
  | 'Offer Released'
  | 'Offer Accepted'
  | 'BGV In Progress'
  | 'Onboarding'
  | 'Ready for Day 1'
  | 'Offer Declined';

export interface CandidateOffer {
  role: string;
  band: string;
  department: string;
  location: string;
  annualCTC: string;
  joiningBonus: string;
  equityGrant: string;
  joiningDate: string;
  reportingManager: string;
  expiryDate: string;
  status: 'Draft' | 'Pending Approval' | 'Released' | 'Accepted' | 'Declined' | 'Expired';
  version: number;
  releasedAt?: string;
  acceptedAt?: string;
}

export type BGVCheckType =
  | 'Identity'
  | 'Address'
  | 'Education'
  | 'Employment history'
  | 'Criminal record'
  | 'Reference';

export type BGVStatus = 'Not Initiated' | 'In Progress' | 'Clear' | 'Discrepancy' | 'Failed';

export interface BGVCheck {
  type: BGVCheckType;
  status: 'Pending' | 'In Progress' | 'Clear' | 'Discrepancy' | 'Failed';
  verifiedDate?: string;
  remarks?: string;
  reportFileName?: string;
}

export interface BGVCase {
  vendor: string;
  initiatedDate?: string;
  tatDueDate: string;
  status: BGVStatus;
  checks: BGVCheck[];
  escalated: boolean;
}

export type AssessmentType =
  | 'psychometric'
  | 'language'
  | 'performance'
  | 'technical'
  | 'at'
  | 'Behavioral'
  | 'Technical'
  | 'Culture Fit'
  | 'Managerial'
  | 'Custom';

export type AssessmentStatus =
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'evaluated'
  | 'expired'
  | 'Assigned'
  | 'In Progress'
  | 'Submitted'
  | 'Evaluated'
  | 'Expired';

export type AssessmentResult =
  | 'pass'
  | 'fail'
  | 'review'
  | 'Pass'
  | 'Fail'
  | 'Review';

export interface AssessmentAttachment {
  name: string;
  size: string;
}

export interface CandidateAssessment {
  id: string;
  candidateId?: string;
  type: AssessmentType;
  title: string;
  assignedAt?: string;
  dueAt?: string;
  status: AssessmentStatus;
  score?: number;
  maxScore: number;
  passMark?: number;
  result?: AssessmentResult;
  evaluatorId?: string;
  evaluatorName?: string;
  remarks?: string;
  attachments?: AssessmentAttachment[];
  meta?: Record<string, unknown>;
  // Backwards compatibility aliases
  assignedDate?: string;
  dueDate?: string;
  passThreshold?: number;
  comments?: string;
}

export type ProvisionItemType =
  | 'Laptop'
  | 'Email & Slack'
  | 'GitHub/Jira/AWS access'
  | 'ID badge'
  | 'Desk/seat'
  | 'Access card'
  | 'SIM/phone'
  | 'Ergonomic Chair'
  | 'Standing Desk'
  | 'Executive Desk'
  | 'Office Pedestal & Locker'
  | 'Welcome Stationery Pack'
  | 'Executive Notebook & Pen Set'
  | 'Desk Organizer & Accessories'
  | 'Company EV / Sedan Allocation'
  | 'Reserved Parking Bay'
  | 'Corporate Fuel Card'
  | 'Driver / Chauffeur Allowance'
  | 'Home Office Allowance'
  | 'Home Ergonomic Setup'
  | 'Dual 4K Monitor Bundle'
  | 'High-Speed Broadband Stipend'
  | 'Noise-Cancelling Headset'
  | 'YubiKey 5C NFC Security Key'
  | 'Corporate Credit Card'
  | 'Executive Club & Gym Pass'
  | 'Corporate Swag & Welcome Bundle'
  | string;

export type ProvisionStatus = 'Requested' | 'In Progress' | 'Ready' | 'Delivered';
export type ProvisionCategory =
  | 'IT'
  | 'Facilities'
  | 'Admin'
  | 'Office Furniture'
  | 'Stationary'
  | 'Car'
  | 'Home'
  | 'Miscellaneous Assets';

export interface ProvisionItem {
  id: string;
  item: ProvisionItemType;
  category: ProvisionCategory;
  status: ProvisionStatus;
  dueDate: string;
  assignedTo: string;
  serialNumber?: string;
  modelDetails?: string;
  blocked?: boolean;
  blockReason?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  avatar: string;
  currentBuddyCount: number;
}

export interface BuddyManagerAssignment {
  managerId?: string;
  managerName?: string;
  managerRole?: string;
  managerEmail?: string;
  managerAvatar?: string;
  buddyId?: string;
  buddyName?: string;
  buddyRole?: string;
  buddyEmail?: string;
  buddyAvatar?: string;
}

export type TrainingBundle = 'Engineering' | 'Sales' | 'Compliance' | 'General';

export interface RecruiterTrainingAssignment {
  id: string;
  moduleId: string;
  title: string;
  bundle: TrainingBundle;
  dueDate: string;
  progress: number;
  isCompleted: boolean;
  isWaived?: boolean;
  waiveReason?: string;
}

export type VisaType = 'Work Permit' | 'H-1B' | 'Blue Card' | 'Intra-company' | 'Other';
export type VisaStage =
  | 'Documents Collection'
  | 'Filed'
  | 'Under Review'
  | 'Approved'
  | 'Visa Stamped'
  | 'Travel Ready'
  | 'RFE'
  | 'Rejected';

export interface VisaCase {
  needsVisa: boolean;
  fromCountry: string;
  toCountry: string;
  visaType: VisaType;
  stage: VisaStage;
  lawyerVendor: string;
  filingDate: string;
  expectedDecision: string;
  startRisk: boolean;
  visaNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  passportExpiry?: string;
  sponsoringEntity?: string;
  costs?: {
    filingFee: number;
    legalFee: number;
    premiumProcessing: number;
    flights: number;
    relocationGrant: number;
    totalCost: number;
    currency: string;
  };
  relocationSupport: {
    flightBooked: boolean;
    housingAssisted: boolean;
    relocationAllowance: boolean;
  };
  checklist: Array<{ id: string; task: string; completed: boolean }>;
  notes: Array<{ id: string; author: string; text: string; date: string }>;
}

export type InsurancePlan = 'Basic' | 'Plus' | 'Premium';
export type InsuranceStatus = 'Not Started' | 'Invited' | 'Submitted' | 'Active' | 'Waived';

export interface Dependent {
  id: string;
  name: string;
  relation: 'Spouse' | 'Child' | 'Parent';
  dob: string;
}

export interface InsuranceEnrolment {
  plan: InsurancePlan;
  dependents: Dependent[];
  enrolmentStatus: InsuranceStatus;
  effectiveDate?: string;
  provider: string;
  nominee?: string;
  ecardIssued: boolean;
  deadlineDate: string;
}

export type MiscTaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';
export type MiscTaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface MiscComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface MiscTask {
  id: string;
  title: string;
  description: string;
  candidateId?: string;
  category: 'Welcome Kit' | 'Relocation' | 'Approvals' | 'Queries' | 'General';
  assignee: string;
  priority: MiscTaskPriority;
  dueDate: string;
  status: MiscTaskStatus;
  comments: MiscComment[];
}

export interface CandidateNote {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string; // ISO date
  actor: string;
  candidateId: string;
  candidateName: string;
  action: string;
  details: string;
  type: 'offer' | 'doc' | 'bgv' | 'team' | 'training' | 'provision' | 'system';
}

export interface RecruiterCandidate {
  id: string;
  candidateCode: string;
  candidateId?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  team: string;
  company: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  avatar: string;
  stage: CandidateStage;
  recruiterOwner: string;
  overallProgress: number; // 0 to 100
  lastActivity: string;
  stepProgress: StepProgressState;
  offer: CandidateOffer;
  documents: UploadedDoc[];
  bgv: BGVCase;
  assessments: CandidateAssessment[];
  provisions: ProvisionItem[];
  buddyManager: BuddyManagerAssignment;
  training: RecruiterTrainingAssignment[];
  visa?: VisaCase;
  insurance: InsuranceEnrolment;
  notes: CandidateNote[];
}
