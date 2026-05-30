import {
  format,
  formatDistanceToNow,
  formatRelative,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addHours,
  subDays,
} from "date-fns";
import { enUS } from "date-fns/locale";

const DEFAULT_LOCALE = enUS;

/**
 * Format a date to "MMM d, yyyy" (e.g., "Jan 15, 2024").
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), "MMM d, yyyy", { locale: DEFAULT_LOCALE });
}

/**
 * Format a date to "MMM d, yyyy h:mm a" (e.g., "Jan 15, 2024 3:30 PM").
 */
export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), "MMM d, yyyy h:mm a", { locale: DEFAULT_LOCALE });
}

/**
 * Format a date to relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: DEFAULT_LOCALE,
  });
}

/**
 * Format a date relative to today (e.g., "Today at 3:30 PM", "Yesterday at 10:00 AM").
 */
export function formatMessageTime(date: Date | string | number): string {
  const d = new Date(date);

  if (isToday(d)) {
    return `Today at ${format(d, "h:mm a", { locale: DEFAULT_LOCALE })}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, "h:mm a", { locale: DEFAULT_LOCALE })}`;
  }

  return format(d, "MMM d, h:mm a", { locale: DEFAULT_LOCALE });
}

/**
 * Get a human-readable conversation timestamp.
 * - Less than 1 hour: "X min ago"
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - Within 7 days: day name
 * - Older: formatted date
 */
export function getConversationTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, d);
  const diffHours = differenceInHours(now, d);
  const diffDays = differenceInDays(now, d);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (diffDays < 7) return format(d, "EEEE", { locale: DEFAULT_LOCALE });

  return formatDate(d);
}

/**
 * Format duration in days for display (e.g., "90 days").
 */
export function formatDurationDays(days: number): string {
  if (days === 1) return "1 day";
  return `${days} days`;
}

/**
 * Check if a subscription expiration is approaching (within 3 days).
 */
export function isExpiringSoon(expiresAt: Date | string | number): boolean {
  const daysLeft = differenceInDays(new Date(expiresAt), new Date());
  return daysLeft <= 3 && daysLeft >= 0;
}

/**
 * Get days remaining until expiration.
 */
export function getDaysRemaining(expiresAt: Date | string | number): number {
  return Math.max(0, differenceInDays(new Date(expiresAt), new Date()));
}
