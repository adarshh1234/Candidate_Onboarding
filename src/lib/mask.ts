/**
 * Masks bank account number, keeping only the last 4 digits visible.
 */
export function maskAccountNumber(accNumber: string): string {
  if (!accNumber) return '';
  const trimmed = accNumber.trim();
  if (trimmed.length <= 4) return trimmed;
  const last4 = trimmed.slice(-4);
  const maskedSection = '•'.repeat(Math.max(0, trimmed.length - 4));
  return `${maskedSection}${last4}`;
}

/**
 * Masks PAN (Permanent Account Number), keeping the first 2 characters and last character visible
 * or masking all except the last 3 characters.
 * Standard format: ABCDE1234F -> ••••••234F
 */
export function maskPan(pan: string): string {
  if (!pan) return '';
  const trimmed = pan.trim().toUpperCase();
  if (trimmed.length <= 4) return trimmed;
  const visibleEnd = trimmed.slice(-3);
  const maskedSection = '•'.repeat(Math.max(0, trimmed.length - 3));
  return `${maskedSection}${visibleEnd}`;
}
