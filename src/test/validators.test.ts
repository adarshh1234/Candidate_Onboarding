import { describe, it, expect } from 'vitest';
import {
  panRegex,
  ifscRegex,
  pincodeRegex,
  isAge18OrAbove,
  bankTaxSchema,
  personalInfoSchema,
} from '@/lib/validators';

describe('Validators & Zod Schemas', () => {
  describe('PAN Regex', () => {
    it('validates correct 10-character PAN formats', () => {
      expect(panRegex.test('ABCDE1234F')).toBe(true);
      expect(panRegex.test('BNZPK9876Q')).toBe(true);
    });

    it('rejects invalid PAN strings', () => {
      expect(panRegex.test('ABCD12345F')).toBe(false); // 4 letters then 5 digits
      expect(panRegex.test('ABCDE12345')).toBe(false); // No trailing letter
      expect(panRegex.test('abcde1234f')).toBe(false); // Lowercase
      expect(panRegex.test('ABCDE1234FF')).toBe(false); // 11 chars
    });
  });

  describe('IFSC Regex', () => {
    it('validates standard 11-char IFSC code with 5th char zero', () => {
      expect(ifscRegex.test('HDFC0001234')).toBe(true);
      expect(ifscRegex.test('SBIN0004567')).toBe(true);
      expect(ifscRegex.test('ICIC0000001')).toBe(true);
    });

    it('rejects invalid IFSC codes', () => {
      expect(ifscRegex.test('HDFC1001234')).toBe(false); // 5th char not 0
      expect(ifscRegex.test('HDF0001234')).toBe(false); // Too short
      expect(ifscRegex.test('HDFC00012345')).toBe(false); // Too long
    });
  });

  describe('Pincode Regex', () => {
    it('validates 6 digit Indian postal codes', () => {
      expect(pincodeRegex.test('560103')).toBe(true);
      expect(pincodeRegex.test('110001')).toBe(true);
    });

    it('rejects invalid pincodes', () => {
      expect(pincodeRegex.test('56010')).toBe(false); // 5 digits
      expect(pincodeRegex.test('5601034')).toBe(false); // 7 digits
      expect(pincodeRegex.test('56010A')).toBe(false); // Contains letter
    });
  });

  describe('Age 18+ Date of Birth Validator', () => {
    it('returns true for birthdates 18 or more years in past', () => {
      expect(isAge18OrAbove('1990-01-01')).toBe(true);
      expect(isAge18OrAbove('2000-06-15')).toBe(true);
    });

    it('returns false for underage birthdates', () => {
      const today = new Date();
      const recentYear = today.getFullYear() - 10;
      expect(isAge18OrAbove(`${recentYear}-01-01`)).toBe(false);
    });

    it('returns false for invalid date strings', () => {
      expect(isAge18OrAbove('')).toBe(false);
      expect(isAge18OrAbove('invalid-date')).toBe(false);
    });
  });

  describe('bankTaxSchema Validation', () => {
    it('passes with matching account numbers and valid PAN/IFSC', () => {
      const validData = {
        accountHolder: 'Aarav Sharma',
        accountNumber: '123456789012',
        confirmAccountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Bellandur',
        accountType: 'Savings',
        panNumber: 'ABCDE1234F',
        uanNumber: '100123456789',
        taxRegime: 'New Regime',
      };
      const result = bankTaxSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails when account number and confirm field mismatch', () => {
      const mismatchedData = {
        accountHolder: 'Aarav Sharma',
        accountNumber: '123456789012',
        confirmAccountNumber: '999999999999',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Bellandur',
        accountType: 'Savings',
        panNumber: 'ABCDE1234F',
        taxRegime: 'New Regime',
      };
      const result = bankTaxSchema.safeParse(mismatchedData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe('Account numbers do not match');
      }
    });
  });

  describe('personalInfoSchema Validation', () => {
    it('validates a complete valid personal form payload', () => {
      const validPayload = {
        fullName: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '+91 9876543210',
        dob: '1995-10-10',
        gender: 'male',
        address: '123 Tech Park Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        country: 'India',
        emergencyName: 'Kavita Sharma',
        emergencyRelation: 'Mother',
        emergencyPhone: '9845012345',
      };
      const result = personalInfoSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects underage candidate', () => {
      const underagePayload = {
        fullName: 'Young Candidate',
        email: 'young@example.com',
        phone: '9876543210',
        dob: '2020-01-01',
        gender: 'male',
        address: '123 Tech Park Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        country: 'India',
        emergencyName: 'Parent',
        emergencyRelation: 'Mother',
        emergencyPhone: '9845012345',
      };
      const result = personalInfoSchema.safeParse(underagePayload);
      expect(result.success).toBe(false);
    });
  });
});
