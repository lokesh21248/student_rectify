"use client";

import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function LiveBadge({ className, size = "sm" }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold rounded-lg text-white bg-red-500",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
      LIVE
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  compact?: boolean;
  className?: string;
}

export function StatusBadge({ status, compact, className }: StatusBadgeProps) {
  const map: Record<string, { label: string; classes: string }> = {
    LIVE: { label: "Live", classes: "badge-live" },
    UPCOMING: { label: "Upcoming", classes: "badge-upcoming" },
    COMPLETED: { label: "Completed", classes: "badge-completed" },
    CANCELLED: { label: "Cancelled", classes: "badge-cancelled" },
    DRAFT: { label: "Draft", classes: "badge-draft" },
    PENDING: { label: "Pending", classes: "badge-pending" },
  };

  const config = map[status] ?? { label: status, classes: "badge-cancelled" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg font-medium text-xs",
        compact ? "px-2 py-0.5" : "px-2.5 py-1",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
