const NOON_HOUR = 12;

export function toStoredDate(date: Date): string {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    NOON_HOUR,
    0,
    0,
    0
  );
  return normalized.toISOString();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString();
}

export function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function parseDateInput(value: string): Date | null {
  const parts = value.split('-').map((part) => Number(part));
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, NOON_HOUR, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}
