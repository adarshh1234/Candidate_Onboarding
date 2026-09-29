import {
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
  UserCheck,
  LucideIcon,
} from 'lucide-react';

export type TrainingTabId =
  | 'materials'
  | 'sessions'
  | 'courses'
  | 'misc'
  | 'trainer';

export interface TrainingTabConfig {
  id: TrainingTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export const TRAINING_TABS: TrainingTabConfig[] = [
  {
    id: 'materials',
    label: 'Learning Materials Assigned',
    shortLabel: 'Assigned Materials',
    icon: BookOpen,
    description: 'Mandatory compliance handbooks, security materials, and role-specific training modules.',
  },
  {
    id: 'sessions',
    label: 'Training Sessions',
    shortLabel: 'Live Sessions',
    icon: Calendar,
    description: 'Scheduled live webinars, orientation workshops, interactive AMAs, and classroom inductions.',
  },
  {
    id: 'courses',
    label: 'Courses:',
    shortLabel: 'Courses',
    icon: GraduationCap,
    description: 'Structured e-learning course curricula, accreditation tracks, and certification pathways.',
  },
  {
    id: 'misc',
    label: 'Misc',
    shortLabel: 'Misc Training',
    icon: Sparkles,
    description: 'Specialized certifications, lab credits, sandbox vouchers, and custom training waivers.',
  },
  {
    id: 'trainer',
    label: 'Trainer',
    shortLabel: 'Trainers',
    icon: UserCheck,
    description: 'Directory of internal faculty, department leads, and certified instructors leading training.',
  },
];

export const DEFAULT_TRAINING_TAB_ID: TrainingTabId = 'materials';

export const VALID_TRAINING_TAB_IDS: TrainingTabId[] = TRAINING_TABS.map((t) => t.id);

export interface TrainingSessionItem {
  id: string;
  title: string;
  category: 'Orientation' | 'Technical' | 'Compliance' | 'Culture' | 'Leadership';
  date: string;
  time: string;
  duration: string;
  trainerName: string;
  trainerRole: string;
  trainerAvatar: string;
  location: string;
  meetingLink?: string;
  attendeesCount: number;
  maxCapacity: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  topics: string[];
}

export const MOCK_TRAINING_SESSIONS: TrainingSessionItem[] = [
  {
    id: 'sess-101',
    title: 'Company Culture, Vision & Executive Welcome',
    category: 'Orientation',
    date: '2026-10-02',
    time: '10:00 AM - 11:30 AM IST',
    duration: '90 mins',
    trainerName: 'Priya Nair',
    trainerRole: 'Head of People & Culture',
    trainerAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    location: 'Auditorium A & Zoom Live',
    meetingLink: 'https://meet.google.com/onboardly-welcome',
    attendeesCount: 14,
    maxCapacity: 30,
    status: 'Upcoming',
    topics: ['Company History & Values', 'Leadership Introduction', 'First 90 Days Roadmap'],
  },
  {
    id: 'sess-102',
    title: 'Information Security, Phishing Defense & GDPR',
    category: 'Compliance',
    date: '2026-10-03',
    time: '02:00 PM - 03:30 PM IST',
    duration: '90 mins',
    trainerName: 'Sameer Qureshi',
    trainerRole: 'Staff Security Engineer',
    trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Virtual Classroom 2',
    meetingLink: 'https://meet.google.com/infosec-training',
    attendeesCount: 22,
    maxCapacity: 25,
    status: 'Upcoming',
    topics: ['SOC-2 & GDPR Basics', 'YubiKey Authentication', 'Reporting Security Threats'],
  },
  {
    id: 'sess-103',
    title: 'Engineering Git Workflow, Microservices & CI/CD',
    category: 'Technical',
    date: '2026-10-05',
    time: '11:00 AM - 01:00 PM IST',
    duration: '120 mins',
    trainerName: 'Vikram Patel',
    trainerRole: 'Staff Frontend Engineer',
    trainerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Engineering Lab B',
    meetingLink: 'https://meet.google.com/eng-bootcamp',
    attendeesCount: 8,
    maxCapacity: 12,
    status: 'Upcoming',
    topics: ['Trunk-based Development', 'Docker & Kubernetes Setup', 'PR Standards & Code Review'],
  },
  {
    id: 'sess-104',
    title: 'Product Strategy, Roadmap & Customer Empathy',
    category: 'Orientation',
    date: '2026-10-06',
    time: '03:00 PM - 04:30 PM IST',
    duration: '90 mins',
    trainerName: 'Marcus Chen',
    trainerRole: 'Director of Product Management',
    trainerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    location: 'Meeting Room 402',
    meetingLink: 'https://meet.google.com/product-vision',
    attendeesCount: 16,
    maxCapacity: 20,
    status: 'Upcoming',
    topics: ['Product Pillars', 'Metrics & OKRs', 'Customer Feedback Loops'],
  },
];

export interface CourseCatalogItem {
  id: string;
  code: string;
  title: string;
  provider: string;
  durationHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolledCount: number;
  completionRate: number;
  bundle: string;
  rating: number;
  syllabus: string[];
}

export const MOCK_COURSE_CATALOG: CourseCatalogItem[] = [
  {
    id: 'crs-201',
    code: 'SEC-101',
    title: 'Zero Trust Architecture & Enterprise Cloud Security',
    provider: 'Internal Security Academy',
    durationHours: 6,
    level: 'Intermediate',
    enrolledCount: 18,
    completionRate: 88,
    bundle: 'Compliance',
    rating: 4.9,
    syllabus: ['Identity & IAM', 'Least Privilege Access', 'Encrypted Workspaces', 'Incident Response'],
  },
  {
    id: 'crs-202',
    code: 'ENG-301',
    title: 'Distributed Systems & Event-Driven Architecture',
    provider: 'Apex Tech University',
    durationHours: 12,
    level: 'Advanced',
    enrolledCount: 12,
    completionRate: 92,
    bundle: 'Engineering',
    rating: 4.8,
    syllabus: ['Kafka Event Streaming', 'Database Sharding', 'Idempotency & Resilience', 'Observability'],
  },
  {
    id: 'crs-203',
    code: 'POSH-001',
    title: 'Workplace Ethics, Diversity & POSH Regulations',
    provider: 'Apex HR Compliance',
    durationHours: 3,
    level: 'Beginner',
    enrolledCount: 24,
    completionRate: 96,
    bundle: 'General',
    rating: 4.95,
    syllabus: ['POSH Framework', 'Inclusivity Guidelines', 'Reporting Grievances', 'Equal Opportunity'],
  },
  {
    id: 'crs-204',
    code: 'SLS-401',
    title: 'Enterprise Solution Selling & MEDDPICC Playbook',
    provider: 'Global Sales Enablement',
    durationHours: 8,
    level: 'Advanced',
    enrolledCount: 9,
    completionRate: 82,
    bundle: 'Sales',
    rating: 4.7,
    syllabus: ['Discovery Frameworks', 'Stakeholder Mapping', 'Objection Handling', 'Contract Closing'],
  },
];

export interface TrainerDirectoryItem {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  specialty: string;
  sessionsConducted: number;
  averageRating: number;
  activeTrainees: number;
  certifications: string[];
}

export const MOCK_TRAINERS: TrainerDirectoryItem[] = [
  {
    id: 'trn-01',
    name: 'Sarah Jenkins',
    role: 'VP of Engineering',
    department: 'Engineering',
    email: 'sarah.jenkins@apex.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Distributed Architecture & Engineering Standards',
    sessionsConducted: 42,
    averageRating: 4.95,
    activeTrainees: 8,
    certifications: ['AWS Solutions Architect Pro', 'Certified Scrum Master'],
  },
  {
    id: 'trn-02',
    name: 'Priya Nair',
    role: 'Lead Talent Partner & Head of People',
    department: 'Human Resources',
    email: 'priya.nair@apex.com',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    specialty: 'Company Culture, POSH & Executive Orientation',
    sessionsConducted: 65,
    averageRating: 4.98,
    activeTrainees: 14,
    certifications: ['SHRM-SCP Certified', 'Certified POSH Facilitator'],
  },
  {
    id: 'trn-03',
    name: 'Sameer Qureshi',
    role: 'Staff Security Engineer',
    department: 'Engineering',
    email: 'sameer.qureshi@apex.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Zero Trust Security, IAM & Anti-Phishing',
    sessionsConducted: 38,
    averageRating: 4.9,
    activeTrainees: 12,
    certifications: ['CISSP', 'CEH Master', 'AWS Security Specialist'],
  },
  {
    id: 'trn-04',
    name: 'Marcus Chen',
    role: 'Director of Product Management',
    department: 'Product',
    email: 'marcus.chen@apex.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Product Vision, Metrics & UX Empathy',
    sessionsConducted: 29,
    averageRating: 4.88,
    activeTrainees: 6,
    certifications: ['Pragmatic Institute Certified', 'Scrum Product Owner'],
  },
  {
    id: 'trn-05',
    name: 'Neha Verma',
    role: 'Senior Director of Data Science & AI',
    department: 'Data & AI',
    email: 'neha.verma@apex.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    specialty: 'AI/ML Systems, Data Governance & LLMs',
    sessionsConducted: 24,
    averageRating: 4.92,
    activeTrainees: 5,
    certifications: ['Stanford ML Faculty Alum', 'TensorFlow Fellow'],
  },
];
