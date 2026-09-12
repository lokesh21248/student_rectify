import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isFuture, isWithinInterval } from 'date-fns';
import { EventComputedStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compute event status from timestamps (client-side).
 */
export function computeEventStatus(
  startAt: string,
  endAt: string,
  dbStatus: string,
  approved: boolean
): EventComputedStatus {
  if (dbStatus === 'cancelled') return 'CANCELLED';
  if (dbStatus === 'draft') return 'DRAFT';
  if (!approved) return 'PENDING';

  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (isFuture(start)) return 'UPCOMING';
  if (isWithinInterval(now, { start, end })) return 'LIVE';
  return 'COMPLETED';
}

/**
 * Format a date range for display.
 */
export function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return `${format(start, 'MMM d, yyyy')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  }

  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Format participant count with K suffix.
 */
export function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get time remaining as countdown parts.
 */
export function getCountdown(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const total = Math.max(0, target - now);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
}

/**
 * Get relative time string.
 */
export function getRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format date for display.
 */
export function formatDate(date: string, formatStr = 'MMM d, yyyy'): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return format(d, formatStr);
  } catch {
    return date;
  }
}

/**
 * Format time for display. Supports both full ISO date strings and Postgres TIME 'HH:mm:ss' strings.
 */
export function formatTime(timeOrDate: string): string {
  if (!timeOrDate) return '';
  // If it's a plain time format like '09:00:00' or '14:30'
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeOrDate.trim())) {
    const [hStr, mStr] = timeOrDate.trim().split(':');
    const h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  }
  try {
    const d = new Date(timeOrDate);
    if (isNaN(d.getTime())) return timeOrDate;
    return format(d, 'h:mm a');
  } catch {
    return timeOrDate;
  }
}

/**
 * Truncate text to given length.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '…';
}

/**
 * Get status badge color/variant.
 */
export function getStatusConfig(status: EventComputedStatus): {
  label: string;
  variant: 'live' | 'upcoming' | 'completed' | 'cancelled' | 'draft' | 'pending';
  color: string;
} {
  switch (status) {
    case 'LIVE':
      return { label: 'Live Now', variant: 'live', color: '#ef4444' };
    case 'UPCOMING':
      return { label: 'Upcoming', variant: 'upcoming', color: '#6366f1' };
    case 'COMPLETED':
      return { label: 'Completed', variant: 'completed', color: '#10b981' };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'cancelled', color: '#94a3b8' };
    case 'DRAFT':
      return { label: 'Draft', variant: 'draft', color: '#f59e0b' };
    case 'PENDING':
      return { label: 'Pending Review', variant: 'pending', color: '#f97316' };
  }
}

/**
 * Build the QR code data for a registration.
 */
export function buildQRData(registrationId: string, eventId: string, userId: string): string {
  return JSON.stringify({ rid: registrationId, eid: eventId, uid: userId });
}

/**
 * Get capacity percentage.
 */
export function getCapacityPercent(registered: number, max: number | null): number {
  if (!max || max === 0) return 0;
  return Math.min(100, Math.round((registered / max) * 100));
}

/**
 * Get seats remaining.
 */
export function getSeatsRemaining(registered: number, max: number | null): number | null {
  if (!max) return null;
  return Math.max(0, max - registered);
}

/**
 * Check if registration is open.
 */
export function isRegistrationOpen(
  deadline: string | null,
  startAt: string,
  status: string,
  registered: number,
  max: number | null
): boolean {
  if (status === 'cancelled') return false;
  if (new Date(startAt) < new Date()) return false; // Event started
  if (deadline && new Date(deadline) < new Date()) return false;
  if (max && registered >= max) return false;
  return true;
}
