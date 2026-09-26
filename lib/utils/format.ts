import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePublicIssueId(count: number): string {
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(6, "0");
  return `SC-${year}-${sequence}`;
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDateTime(date);
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; badgeClass: string; description: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    color: "#94a3b8",
    dotColor: "bg-slate-500 dark:bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 font-semibold",
    description: "Issue received and awaiting verification",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "#6366f1",
    dotColor: "bg-indigo-600 dark:bg-indigo-400",
    badgeClass: "bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700 font-semibold",
    description: "Issue is being examined by department coordinator or campus ops",
  },
  VERIFIED: {
    label: "Verified",
    color: "#3b82f6",
    dotColor: "bg-blue-600 dark:bg-blue-400",
    badgeClass: "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700 font-semibold",
    description: "Validated by campus admin and ready for assignment",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "#4f46e5",
    dotColor: "bg-indigo-600 dark:bg-indigo-400",
    badgeClass: "bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700 font-semibold",
    description: "Assigned to maintenance team technician",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#f59e0b",
    dotColor: "bg-amber-500 dark:bg-amber-400",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600 font-semibold",
    description: "Maintenance team is actively working on resolving the issue",
  },
  RESOLVED: {
    label: "Resolved",
    color: "#10b981",
    dotColor: "bg-emerald-600 dark:bg-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-600 font-semibold",
    description: "Work completed. Pending confirmation from student or reporter",
  },
  USER_CONFIRMED: {
    label: "User Confirmed",
    color: "#059669",
    dotColor: "bg-teal-600 dark:bg-teal-400",
    badgeClass: "bg-teal-100 text-teal-950 border-teal-400 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-600 font-semibold",
    description: "Reporter verified that the problem is fixed satisfactorily",
  },
  CLOSED: {
    label: "Closed",
    color: "#475569",
    dotColor: "bg-zinc-500 dark:bg-zinc-400",
    badgeClass: "bg-zinc-200 text-zinc-900 border-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 font-semibold",
    description: "Ticket closed and archived",
  },
  REOPENED: {
    label: "Reopened",
    color: "#ef4444",
    dotColor: "bg-rose-600 dark:bg-rose-400",
    badgeClass: "bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-600 font-semibold",
    description: "Reporter indicated problem was not resolved adequately",
  },
  REJECTED: {
    label: "Rejected",
    color: "#dc2626",
    dotColor: "bg-red-600 dark:bg-red-400",
    badgeClass: "bg-red-100 text-red-950 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-600 font-semibold",
    description: "Ticket invalidated or out of scope",
  },
  DUPLICATE: {
    label: "Duplicate",
    color: "#78716c",
    dotColor: "bg-stone-500 dark:bg-stone-400",
    badgeClass: "bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-600 font-semibold",
    description: "Marked as duplicate of an existing unresolved campus report",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "#ea580c",
    dotColor: "bg-orange-500 dark:bg-orange-400",
    badgeClass: "bg-orange-100 text-orange-950 border-orange-400 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-600 font-semibold",
    description: "Awaiting replacement parts, vendor visit, or campus scheduling",
  },
};

export const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; badgeClass: string }
> = {
  LOW: {
    label: "Low",
    color: "#64748b",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 font-bold",
  },
  MEDIUM: {
    label: "Medium",
    color: "#0284c7",
    badgeClass: "bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-600 font-bold",
  },
  HIGH: {
    label: "High",
    color: "#d97706",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-600 font-bold",
  },
  CRITICAL: {
    label: "Critical",
    color: "#dc2626",
    badgeClass: "bg-red-100 text-red-950 border-red-400 dark:bg-red-950 dark:text-red-200 dark:border-red-600 font-bold animate-pulse",
  },
};

export function isValidStatusTransition(
  currentStatus: string,
  nextStatus: string,
  role: string
): boolean {
  if (currentStatus === nextStatus) return true;

  // Admin and Department Coordinator can manage full transitions
  if (role === "ADMIN" || role === "DEPARTMENT_COORDINATOR") {
    if (currentStatus === "CLOSED" && nextStatus === "IN_PROGRESS") return false; // Must reopen first
    return true;
  }

  // Maintenance Staff / Staff transitions
  if (role === "STAFF" || role === "MAINTENANCE_STAFF") {
    if (currentStatus === "ASSIGNED" && (nextStatus === "IN_PROGRESS" || nextStatus === "ON_HOLD")) return true;
    if (currentStatus === "IN_PROGRESS" && (nextStatus === "RESOLVED" || nextStatus === "ON_HOLD")) return true;
    if (currentStatus === "ON_HOLD" && nextStatus === "IN_PROGRESS") return true;
    if (currentStatus === "REOPENED" && nextStatus === "IN_PROGRESS") return true;
    return false;
  }

  // Student / Faculty / General User transitions
  if (role === "USER" || role === "STUDENT" || role === "FACULTY") {
    if (currentStatus === "RESOLVED" && (nextStatus === "USER_CONFIRMED" || nextStatus === "CLOSED" || nextStatus === "REOPENED")) return true;
    return false;
  }

  return false;
}
