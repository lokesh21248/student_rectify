"use client";

import { motion } from "framer-motion";
import { SearchX, Calendar, Award, FileX, WifiOff, AlertCircle, Inbox } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EmptyStateType =
  | "no-events"
  | "no-results"
  | "no-registrations"
  | "no-certificates"
  | "registration-closed"
  | "event-full"
  | "event-cancelled"
  | "no-photos"
  | "network-error"
  | "unauthorized"
  | "not-found"
  | "generic";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

const configs: Record<EmptyStateType, {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}> = {
  "no-events": {
    icon: Calendar,
    title: "No events found",
    description: "There are no events matching your criteria. Try adjusting your filters.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
  "no-results": {
    icon: SearchX,
    title: "No results found",
    description: "We couldn't find anything matching your search. Try different keywords.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
  "no-registrations": {
    icon: Inbox,
    title: "No registrations yet",
    description: "You haven't registered for any events yet. Explore events and register!",
    iconColor: "text-primary-400",
    iconBg: "bg-primary-50",
  },
  "no-certificates": {
    icon: Award,
    title: "No certificates yet",
    description: "Attend events to earn certificates. They'll appear here when available.",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-50",
  },
  "registration-closed": {
    icon: AlertCircle,
    title: "Registration closed",
    description: "Registration for this event is no longer available.",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-50",
  },
  "event-full": {
    icon: AlertCircle,
    title: "Event is full",
    description: "This event has reached its maximum participant capacity.",
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
  },
  "event-cancelled": {
    icon: AlertCircle,
    title: "Event cancelled",
    description: "This event has been cancelled by the organizer.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
  "no-photos": {
    icon: FileX,
    title: "No photos yet",
    description: "Photos for this event haven't been uploaded yet.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
  "network-error": {
    icon: WifiOff,
    title: "Connection issue",
    description: "Unable to load content. Check your internet connection and try again.",
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
  },
  "unauthorized": {
    icon: AlertCircle,
    title: "Access denied",
    description: "You don't have permission to view this content.",
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
  },
  "not-found": {
    icon: SearchX,
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
  "generic": {
    icon: Inbox,
    title: "Nothing here",
    description: "There's nothing to show right now.",
    iconColor: "text-slate-400",
    iconBg: "bg-slate-50",
  },
};

export function EmptyState({
  type = "generic",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
          config.iconBg
        )}
      >
        <Icon className={cn("w-8 h-8", config.iconColor)} />
      </div>
      <h3 className="text-slate-900 font-semibold text-lg mb-2">
        {title || config.title}
      </h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        {description || config.description}
      </p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
