import type { PriorityUrgency } from "./types";

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact naira for dense surfaces: ₦7.5M, ₦850K. */
export function formatNairaCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `₦${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    const thousands = amount / 1_000;
    return `₦${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K`;
  }
  return formatNaira(amount);
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso);
}

/* ------------------------------------------------------------------ *
 * Deadline maths
 *
 * All comparisons are day-based (midnight to midnight) so a deadline "today"
 * never flips to overdue partway through the working day.
 * ------------------------------------------------------------------ */

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/** Whole days from today to `iso`. Negative when the date has passed. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = startOfDay(target).getTime() - startOfDay(new Date()).getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Whole days since `iso`. Negative when the date is in the future. */
export function daysSince(iso: string | null | undefined): number | null {
  const until = daysUntil(iso);
  return until === null ? null : -until;
}

export function isOverdue(iso: string | null | undefined): boolean {
  const days = daysUntil(iso);
  return days !== null && days < 0;
}

/** "Overdue by 2 days" · "Due today" · "Due tomorrow" · "Due in 5 days" · "Due 18 Aug". */
export function formatDueLabel(iso: string | null | undefined): string {
  const days = daysUntil(iso);
  if (days === null) return "No date set";
  if (days < 0) {
    const overdueBy = Math.abs(days);
    return `Overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 6) return `Due in ${days} days`;
  return `Due ${formatShortDate(iso!)}`;
}

/** Short form for table cells: "Overdue" · "Today" · "Tomorrow" · "18 Aug". */
export function formatDueShort(iso: string | null | undefined): string {
  const days = daysUntil(iso);
  if (days === null) return "—";
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 6) return `${days} days`;
  return formatShortDate(iso!);
}

export function urgencyFor(iso: string | null | undefined): PriorityUrgency {
  const days = daysUntil(iso);
  if (days === null) return "normal";
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  return "normal";
}

/** Adds `days` to today and returns an ISO date string (day granularity). */
export function isoInDays(days: number): string {
  const target = new Date();
  target.setHours(12, 0, 0, 0);
  target.setDate(target.getDate() + days);
  return target.toISOString();
}

/** Pluralise without a library: `plural(1, "day")` → "1 day". */
export function plural(count: number, noun: string, suffix = "s"): string {
  return `${count} ${noun}${count === 1 ? "" : suffix}`;
}
