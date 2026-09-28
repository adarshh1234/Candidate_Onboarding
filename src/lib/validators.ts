import { z } from 'zod';

export const phoneRegex = /^(\+91[-\s]?)?[6789]\d{9}$/;
export const pincodeRegex = /^\d{6}$/;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const uanRegex = /^(\d{12})?$/;

/**
 * Checks if a given date of birth corresponds to an age of at least 18 years.
 */
export function isAge18OrAbove(dobStr: string): boolean {
  if (!dobStr) return false;
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
}

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid 10-digit Indian phone number (optionally prefixed with +91)'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(isAge18OrAbove, {
      message: 'You must be at least 18 years of age to register',
    }),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say'], {
    required_error: 'Please select a gender option',
  }),
  address: z.string().trim().min(5, 'Street address must be at least 5 characters'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().regex(pincodeRegex, 'Pincode must be exactly 6 digits'),
  country: z.string().trim().min(2, 'Country is required'),
  emergencyName: z.string().trim().min(2, 'Emergency contact name is required'),
  emergencyRelation: z.string().trim().min(2, 'Relationship is required'),
  emergencyPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid 10-digit phone number for emergency contact'),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const bankTaxSchema = z
  .object({
    accountHolder: z.string().trim().min(2, 'Account holder name is required'),
    accountNumber: z
      .string()
      .trim()
      .regex(/^\d{9,18}$/, 'Account number must be 9 to 18 digits'),
    confirmAccountNumber: z.string().trim().min(1, 'Please confirm account number'),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(ifscRegex, 'IFSC must follow standard format (e.g., HDFC0001234)'),
    bankName: z.string().trim().min(2, 'Bank name is required'),
    branchName: z.string().trim().min(2, 'Branch name is required'),
    accountType: z.enum(['Savings', 'Current'], {
      required_error: 'Select account type',
    }),
    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(panRegex, 'PAN must be 10 characters (e.g., ABCDE1234F)'),
    uanNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^\d{12}$/.test(val),
        'UAN must be exactly 12 digits if provided',
      ),
    taxRegime: z.enum(['New Regime', 'Old Regime'], {
      required_error: 'Select a tax regime',
    }),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber'],
  });

export type BankTaxFormData = z.infer<typeof bankTaxSchema>;
