"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, Heart, Wifi } from "lucide-react";
import { formatDate, formatTime, formatCount } from "@/lib/utils";
import { EventWithStatus } from "@/types";
import { CountdownTimer } from "./CountdownTimer";
import { LiveBadge } from "./LiveBadge";
import { StatusBadge } from "./StatusBadge";

interface EventCardProps {
  event: EventWithStatus;
  className?: string;
}

export function EventCard({ event, className = "" }: EventCardProps) {
  const status = event.computed_status;
  const isLive = status === "LIVE";
  const isUpcoming = status === "UPCOMING";

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* 1. IMAGE */}
      <div className="relative aspect-video w-full bg-slate-100 shrink-0 overflow-hidden">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50/50">
            <span className="text-4xl opacity-30">🎓</span>
          </div>
        )}
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 2. CATEGORY & LIVE BADGES (Top Overlay) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-sm">
            {event.category_name || "Event"}
          </span>
          {isLive && <LiveBadge />}
        </div>

        {/* Mode indicator */}
        {event.mode === "online" && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-sm shadow-sm border border-slate-200/50">
              <Wifi className="w-3 h-3 text-emerald-600" />
              Online
            </span>
          </div>
        )}
      </div>

      {/* 3-7. CARD CONTENT */}
      <div className="flex flex-col flex-1 p-5">
        {/* 3. TITLE */}
        <h3 className="text-[17px] font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>

        {/* 4. COLLEGE / ORGANIZER */}
        <p className="text-xs font-semibold text-slate-500 mb-4 truncate">
          {event.college_name || event.organizer_name || "EduEvents Organizer"}
        </p>

        {/* 5. DATE + TIME & LOCATION */}
        <div className="space-y-2 mb-5 text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium truncate">
              {formatDate(event.start_at)} · {formatTime(event.start_at)}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium truncate">
                {event.venue}
              </span>
            </div>
          )}
        </div>

        {/* 6. STATS & COUNTDOWN */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-semibold text-slate-600">{formatCount(event.interest_count)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-slate-600">{formatCount(event.registration_count)}</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {isUpcoming && <CountdownTimer targetDate={event.start_at} compact />}
            {isLive && <CountdownTimer targetDate={event.end_at} compact label="Ends" />}
            {!isUpcoming && !isLive && <StatusBadge status={status} compact />}
          </div>
        </div>

        {/* 7. ACTION BUTTON */}
        <div className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors">
          {isLive ? "Join Live Event →" : isUpcoming ? "Register Now" : "View Details"}
        </div>
      </div>
    </Link>
  );
}
