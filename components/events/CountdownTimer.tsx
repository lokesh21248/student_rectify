"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
  label?: string;
  className?: string;
  onExpire?: () => void;
}

export function CountdownTimer({
  targetDate,
  compact = false,
  label = "Starts",
  className,
  onExpire,
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    setCountdown(getCountdown(targetDate));

    const interval = setInterval(() => {
      const next = getCountdown(targetDate);
      setCountdown(next);
      if (next.total <= 0 && onExpire) {
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!mounted) {
    if (compact) {
      return (
        <span
          suppressHydrationWarning
          className={cn(
            "text-xs font-medium text-primary-600 tabular-nums inline-block",
            className
          )}
        >
          {label ? `${label} ` : ""}00:00:00
        </span>
      );
    }
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {["Days", "Hours", "Mins", "Secs"].map((lbl) => (
          <div key={lbl} className="text-center">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
              <span suppressHydrationWarning className="text-2xl font-bold text-slate-900 tabular-nums">00</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{lbl}</p>
          </div>
        ))}
      </div>
    );
  }

  if (countdown.total <= 0) return null;

  if (compact) {
    // Compact format: "9d 13h" or "02:14:36"
    const parts =
      countdown.days > 0
        ? `${countdown.days}d ${countdown.hours}h`
        : `${String(countdown.hours).padStart(2, "0")}:${String(countdown.minutes).padStart(2, "0")}:${String(countdown.seconds).padStart(2, "0")}`;

    return (
      <span
        suppressHydrationWarning
        className={cn(
          "text-xs font-medium text-primary-600 tabular-nums inline-block",
          className
        )}
      >
        {label ? `${label} ` : ""}{parts}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {[
        { value: countdown.days, label: "Days" },
        { value: countdown.hours, label: "Hours" },
        { value: countdown.minutes, label: "Mins" },
        { value: countdown.seconds, label: "Secs" },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
            <span suppressHydrationWarning className="text-2xl font-bold text-slate-900 tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
