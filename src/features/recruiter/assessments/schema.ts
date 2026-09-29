import { z } from 'zod';

export const assignAssessmentSchema = z.object({
  type: z.enum(['psychometric', 'language', 'performance', 'technical', 'at']),
  title: z.string().min(3, 'Assessment title must be at least 3 characters'),
  candidateIds: z.array(z.string()).min(1, 'Please select at least one candidate'),
  dueAt: z.string().min(1, 'Target due date is required'),
  passMark: z.coerce.number().min(0).max(100).default(70),
  evaluatorId: z.string().optional(),
  instructions: z.string().optional(),
  // Type-specific optional fields
  meta: z.record(z.any()).optional(),
});

export type AssignAssessmentFormValues = z.infer<typeof assignAssessmentSchema>;

export const psychometricEvaluateSchema = z.object({
  openness: z.coerce.number().min(0).max(100),
  conscientiousness: z.coerce.number().min(0).max(100),
  extraversion: z.coerce.number().min(0).max(100),
  agreeableness: z.coerce.number().min(0).max(100),
  emotionalStability: z.coerce.number().min(0).max(100),
  band: z.enum(['Recommended', 'Recommended with Reservations', 'Not Recommended']),
  remarks: z.string().min(3, 'Review remarks are required'),
});

export type PsychometricEvaluateFormValues = z.infer<typeof psychometricEvaluateSchema>;

export const languageEvaluateSchema = z.object({
  reading: z.coerce.number().min(0).max(100),
  writing: z.coerce.number().min(0).max(100),
  listening: z.coerce.number().min(0).max(100),
  speaking: z.coerce.number().min(0).max(100),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  writtenSampleUrl: z.string().url('Must be a valid URL (e.g. https://...)').or(z.literal('')).optional(),
  remarks: z.string().min(3, 'Assessor remarks are required'),
});

export type LanguageEvaluateFormValues = z.infer<typeof languageEvaluateSchema>;

export const performanceEvaluateSchema = z.object({
  ownership: z.coerce.number().min(1).max(5),
  collaboration: z.coerce.number().min(1).max(5),
  problemSolving: z.coerce.number().min(1).max(5),
  delivery: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  evidenceOwnership: z.string().optional(),
  evidenceCollaboration: z.string().optional(),
  evidenceProblemSolving: z.string().optional(),
  evidenceDelivery: z.string().optional(),
  evidenceCommunication: z.string().optional(),
  recommendation: z.enum(['Exceeds', 'Meets', 'Below']),
  remarks: z.string().min(3, 'Performance review summary is required'),
});

export type PerformanceEvaluateFormValues = z.infer<typeof performanceEvaluateSchema>;

export const technicalEvaluateSchema = z.object({
  sections: z.array(
    z.object({
      name: z.string().min(1, 'Section name is required'),
      score: z.coerce.number().min(0, 'Score must be >= 0'),
      maxScore: z.coerce.number().min(1, 'Max score must be >= 1'),
    })
  ).min(1, 'At least one section score is required'),
  passMark: z.coerce.number().min(0).max(100),
  repoLink: z.string().url('Please enter a valid URL (e.g. https://github.com/...)').or(z.literal('')).optional(),
  proctored: z.boolean().default(false),
  proctoringNote: z.string().optional(),
  result: z.enum(['pass', 'fail', 'review']),
  remarks: z.string().min(3, 'Technical interview notes are required'),
});

export type TechnicalEvaluateFormValues = z.infer<typeof technicalEvaluateSchema>;

export const genericEvaluateSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  passMark: z.coerce.number().min(0).max(100),
  result: z.enum(['pass', 'fail', 'review']),
  remarks: z.string().min(3, 'Evaluation remarks are required'),
});

export type GenericEvaluateFormValues = z.infer<typeof genericEvaluateSchema>;
