import {
  Brain,
  Languages,
  Briefcase,
  Code2,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { AssessmentType } from '@/types';

export interface AssessmentTabConfig {
  id: AssessmentType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
  defaultTitle: string;
}

export const ASSESSMENT_TABS: AssessmentTabConfig[] = [
  {
    id: 'psychometric',
    label: 'Psychometric Tests',
    shortLabel: 'Psychometric',
    icon: Brain,
    description: 'Behavioral traits, situational judgement, cognitive profiling, and cultural work values.',
    defaultTitle: 'Executive Personality & Behavioral Profile',
  },
  {
    id: 'language',
    label: 'Language + Communication Assessment',
    shortLabel: 'Language',
    icon: Languages,
    description: 'CEFR-graded multi-module fluency evaluation covering reading, writing, listening, and speaking.',
    defaultTitle: 'Business English & Client Communication Evaluation',
  },
  {
    id: 'performance',
    label: 'Performance Assessment',
    shortLabel: 'Performance',
    icon: Briefcase,
    description: 'Practical work simulation, structured business case study, and probation milestone reviews.',
    defaultTitle: 'Practical Scenario & Role Simulation',
  },
  {
    id: 'technical',
    label: 'Technical Assessment',
    shortLabel: 'Technical',
    icon: Code2,
    description: 'Hands-on coding challenges, algorithmic architecture, and proctored live take-home reviews.',
    defaultTitle: 'Senior Engineering System Design & Coding Challenge',
  },
  {
    id: 'at',
    label: 'AT Assessment',
    shortLabel: 'AT Assessment',
    icon: Layers,
    description: 'Apex Talent proprietary standardized aptitude, cognitive velocity, and role competency benchmark.',
    defaultTitle: 'Apex Talent Standardized Benchmark Battery',
  },
];

export const VALID_TAB_IDS: AssessmentType[] = [
  'psychometric',
  'language',
  'performance',
  'technical',
  'at',
];

export const DEFAULT_TAB_ID: AssessmentType = 'psychometric';

// Psychometric Constants
export const PSYCHOMETRIC_TEST_NAMES = [
  'Personality Profile',
  'Cognitive Ability',
  'Situational Judgement',
  'Work Values',
] as const;

export const PSYCHOMETRIC_TRAITS = [
  { key: 'openness', label: 'Openness to Experience', desc: 'Intellectual curiosity, creative agility, and adaptability to change.' },
  { key: 'conscientiousness', label: 'Conscientiousness', desc: 'Goal-directed behavior, meticulous planning, and dependability.' },
  { key: 'extraversion', label: 'Extraversion', desc: 'Energy, enthusiasm, assertiveness, and sociability in team settings.' },
  { key: 'agreeableness', label: 'Agreeableness', desc: 'Trust, empathy, cooperative teamwork, and cross-functional harmony.' },
  { key: 'emotionalStability', label: 'Emotional Stability', desc: 'Stress resilience, composure under pressure, and emotional regulation.' },
] as const;

export const PSYCHOMETRIC_BANDS = [
  'Recommended',
  'Recommended with Reservations',
  'Not Recommended',
] as const;

// Language Constants
export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Kannada', 'Tamil', 'Other'] as const;

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export const LANGUAGE_MODULES = [
  { key: 'reading', label: 'Reading Comprehension', weight: 0.25 },
  { key: 'writing', label: 'Business Writing & Syntax', weight: 0.25 },
  { key: 'listening', label: 'Listening & Audio Comprehension', weight: 0.25 },
  { key: 'speaking', label: 'Spoken Fluency & Pronunciation', weight: 0.25 },
] as const;

// Performance Constants
export const PERFORMANCE_SUBTYPES = [
  'Work Simulation',
  'Case Study',
  'Probation Goal Review',
  'Presentation',
] as const;

export const PERFORMANCE_COMPETENCIES = [
  {
    key: 'ownership',
    label: 'Ownership & Accountability',
    descriptors: {
      1: 'Rarely takes initiative; requires constant oversight',
      2: 'Takes basic responsibility when prompted',
      3: 'Consistently owns commitments and unblocks blockers',
      4: 'Proactively anticipates challenges and leads outcomes',
      5: 'Exceptional ownership across company-wide deliverables',
    },
  },
  {
    key: 'collaboration',
    label: 'Cross-functional Collaboration',
    descriptors: {
      1: 'Works in isolation; friction with stakeholders',
      2: 'Cooperates within immediate team only',
      3: 'Collaborates effectively across product, design, and ops',
      4: 'Builds strong bridges, mentors peers, resolves misalignment',
      5: 'Exemplary multiplier effect across multi-disciplinary squads',
    },
  },
  {
    key: 'problemSolving',
    label: 'Analytical Problem Solving',
    descriptors: {
      1: 'Struggles with unstructured problem statements',
      2: 'Solves known issues but struggles with root causes',
      3: 'Rigorously breaks down problems with data and logic',
      4: 'Formulates innovative solutions to complex systemic issues',
      5: 'Industry-level first-principles problem solver',
    },
  },
  {
    key: 'delivery',
    label: 'Speed & Quality of Delivery',
    descriptors: {
      1: 'Frequent delays and quality regressions',
      2: 'Meets deadlines with variable output quality',
      3: 'Consistently ships high-quality output on scheduled sprint cadence',
      4: 'High-velocity delivery with robust test coverage and docs',
      5: 'Sets team benchmark for execution speed and craft',
    },
  },
  {
    key: 'communication',
    label: 'Clarity of Communication',
    descriptors: {
      1: 'Unclear updates; misinterprets project briefs',
      2: 'Adequate tactical communication, lacks strategic nuance',
      3: 'Crisp, structured written and spoken stakeholder updates',
      4: 'Inspiring, concise communication that clarifies ambiguity',
      5: 'Executive-level clarity in technical and business storytelling',
    },
  },
] as const;

export const PERFORMANCE_RECOMMENDATIONS = ['Exceeds', 'Meets', 'Below'] as const;

// Technical Constants
export const TECHNICAL_TRACKS = [
  'Frontend',
  'Backend',
  'DevOps',
  'Data/AI',
  'QA',
  'Mobile',
] as const;

export const TECHNICAL_FORMATS = [
  'Online Test',
  'Live Coding',
  'Take-home',
  'System Design',
] as const;

export const TECHNICAL_PLATFORMS = [
  'HackerRank',
  'CoderPad',
  'GitHub Classroom',
  'LeetCode Enterprise',
] as const;

// AT Assessment Constants
export const AT_ASSESSMENT_NAMES = [
  'AT Core Aptitude & Reasoning',
  'AT Systems Competency',
  'AT Role Simulation',
  'AT Leadership Inventory',
] as const;

export const EVALUATOR_EMPLOYEES = [
  { id: 'EMP-101', name: 'Sarah Jenkins', role: 'VP of Engineering' },
  { id: 'EMP-102', name: 'Vikram Patel', role: 'Lead Architect' },
  { id: 'EMP-103', name: 'Priya Nair', role: 'Staff Recruiter' },
  { id: 'EMP-104', name: 'Ananya Deshmukh', role: 'Principal Designer' },
  { id: 'EMP-105', name: 'Rohan Mehra', role: 'DevOps & Cloud Lead' },
  { id: 'EMP-106', name: 'Deepak Varma', role: 'Head of Data Science' },
];
