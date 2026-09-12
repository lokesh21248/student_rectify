"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, CheckCircle2, Heart, QrCode, ArrowRight, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/events/LiveBadge";
import { formatDate, formatTime, computeEventStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MyEventsClientProps {
  registrations: any[];
  interests: any[];
  attended: any[];
}

const tabs = [
  { id: "registered", label: "Registered" },
  { id: "interested", label: "Interested" },
  { id: "attended", label: "Attended" },
];

export function MyEventsClient({ registrations, interests, attended }: MyEventsClientProps) {
  const [activeTab, setActiveTab] = useState("registered");

  const activeRegistrations = registrations.filter((r) => r.status === "registered");
  const cancelledRegistrations = registrations.filter((r) => r.status === "cancelled");

  return (
    <div className="container-page py-8 page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
        <p className="text-sm text-slate-500 mt-1">All your event activity in one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => {
          const count =
            tab.id === "registered" ? activeRegistrations.length :
            tab.id === "interested" ? interests.length :
            attended.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 font-semibold",
                  activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-slate-200 text-slate-600"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Registered */}
      {activeTab === "registered" && (
        <div className="space-y-4">
          {activeRegistrations.length === 0 ? (
            <EmptyState
              type="no-registrations"
              action={{ label: "Explore Events", href: "/events" }}
            />
          ) : (
            activeRegistrations.map((reg) => (
              <RegistrationCard key={reg.id} registration={reg} />
            ))
          )}
          {cancelledRegistrations.length > 0 && (
            <div className="mt-8">
              <p className="text-sm text-slate-500 font-medium mb-3">Cancelled Registrations</p>
              <div className="space-y-3 opacity-60">
                {cancelledRegistrations.map((reg) => (
                  <RegistrationCard key={reg.id} registration={reg} cancelled />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interested */}
      {activeTab === "interested" && (
        <div className="space-y-4">
          {interests.length === 0 ? (
            <EmptyState
              type="generic"
              title="No saved events"
              description="Mark events as interested to save them here."
              action={{ label: "Explore Events", href: "/events" }}
            />
          ) : (
            interests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} />
            ))
          )}
        </div>
      )}

      {/* Attended */}
      {activeTab === "attended" && (
        <div className="space-y-4">
          {attended.length === 0 ? (
            <EmptyState
              type="no-registrations"
              title="No events attended"
              description="Events you attend will appear here. Register and show up!"
              action={{ label: "Explore Events", href: "/events" }}
            />
          ) : (
            attended.map((att) => (
              <AttendanceCard key={att.id} attendance={att} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RegistrationCard({ registration, cancelled }: { registration: any; cancelled?: boolean }) {
  const event = registration.events;
  if (!event) return null;
  const status = computeEventStatus(event.start_at, event.end_at, "published", true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex"
    >
      {/* Image */}
      <div className="relative w-24 sm:w-32 flex-shrink-0">
        {event.banner_url ? (
          <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-primary-50" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={status} compact />
            {cancelled && (
              <span className="text-xs text-red-500 font-medium">Cancelled</span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{event.title}</h3>
          {event.colleges?.name && (
            <p className="text-xs text-slate-500 mt-0.5">{event.colleges.name}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(event.start_at)}
            </span>
            <span className="font-mono text-slate-500">{registration.registration_number}</span>
          </div>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 flex-shrink-0"
        >
          View <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

function InterestCard({ interest }: { interest: any }) {
  const event = interest.events;
  if (!event) return null;
  const status = computeEventStatus(event.start_at, event.end_at, "published", true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex"
    >
      <div className="relative w-24 sm:w-32 flex-shrink-0">
        {event.banner_url ? (
          <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-red-50" />
        )}
      </div>
      <div className="flex-1 p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={status} compact />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{event.title}</h3>
          {event.colleges?.name && (
            <p className="text-xs text-slate-500 mt-0.5">{event.colleges.name}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {formatDate(event.start_at)}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          <Link
            href={`/events/${event.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            View <ArrowRight className="w-3 h-3" />
          </Link>
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
        </div>
      </div>
    </motion.div>
  );
}

function AttendanceCard({ attendance }: { attendance: any }) {
  const event = attendance.events;
  if (!event) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm flex"
    >
      <div className="relative w-24 sm:w-32 flex-shrink-0">
        {event.banner_url ? (
          <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-emerald-50" />
        )}
      </div>
      <div className="flex-1 p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Attended</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{event.title}</h3>
          {event.colleges?.name && (
            <p className="text-xs text-slate-500 mt-0.5">{event.colleges.name}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            Checked in {formatDate(attendance.checked_in_at, "MMM d, h:mm a")}
          </div>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 flex-shrink-0"
        >
          View <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
