import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] ?? 'Bytes'}`;
}

export function calculateDaysLeft(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const today = new Date();
  // reset hours to midnight for date-only comparison
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  return formatBytes(bytes);
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename = 'export.csv'
) {
  if (data.length === 0) return;
  const first = data[0];
  if (!first) return;
  const headers = Object.keys(first);
  const headerLine = headers.map((h) => `"${h}"`).join(',');
  const rowLines = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csvContent = [headerLine, ...rowLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
