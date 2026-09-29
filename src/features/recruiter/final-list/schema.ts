import { z } from 'zod';

export const addCandidateSchema = z.object({
  name: z.string().min(2, 'Candidate name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.string().min(2, 'Role/designation is required'),
  department: z.string().min(1, 'Please select a department'),
  location: z.string().min(1, 'Please select a location'),
  startDate: z.string().min(1, 'Target joining date is required'),
  annualCTC: z.string().min(1, 'Annual CTC is required (e.g. ₹28,00,000 INR)'),
  recruiterOwner: z.string().default('Priya Nair'),
});

export type AddCandidateFormValues = z.infer<typeof addCandidateSchema>;
