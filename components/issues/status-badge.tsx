import React from "react";
import { STATUS_CONFIG, PRIORITY_CONFIG, cn } from "@/lib/utils/format";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    dotColor: "bg-slate-500",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs transition-colors",
        config.badgeClass,
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", (config as any).dotColor || "bg-current")} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority,
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border uppercase tracking-wider shadow-2xs transition-colors",
        config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
