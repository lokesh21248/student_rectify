import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Users, Activity, Award, Plus, Eye, Edit, BarChart3,
  QrCode, TrendingUp, Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate, computeEventStatus } from "@/lib/utils";
import { StatusBadge } from "@/components/events/LiveBadge";
import { LiveBadge } from "@/components/events/LiveBadge";

export const metadata: Metadata = {
  title: "Organizer Dashboard",
  description: "Manage your events, registrations, attendance and certificates.",
};

async function getOrganizerData(userId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) return null;

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, display_name, approved")
    .eq("user_id", profile.id)
    .single();

  if (!organizer) return null;

  const { data: events } = await supabase
    .from("events")
    .select("id, slug, title, status, start_at, end_at, approved, banner_url")
    .eq("organizer_id", organizer.id)
    .order("created_at", { ascending: false });

  const eventIds = (events || []).map((e: any) => e.id);

  const [regCount, attCount, certCount] = await Promise.all([
    eventIds.length
      ? supabase.from("event_registrations").select("id", { count: "exact", head: true }).in("event_id", eventIds).eq("status", "registered")
      : { count: 0 },
    eventIds.length
      ? supabase.from("event_attendance").select("id", { count: "exact", head: true }).in("event_id", eventIds)
      : { count: 0 },
    eventIds.length
      ? supabase.from("certificates").select("id", { count: "exact", head: true }).in("event_id", eventIds)
      : { count: 0 },
  ]);

  const eventsWithStatus = (events || []).map((e: any) => ({
    ...e,
    computed_status: computeEventStatus(e.start_at, e.end_at, e.status, e.approved),
  }));

  const liveCount = eventsWithStatus.filter((e: any) => e.computed_status === "LIVE").length;
  const upcomingCount = eventsWithStatus.filter((e: any) => e.computed_status === "UPCOMING").length;

  return {
    organizer,
    events: eventsWithStatus,
    stats: {
      totalEvents: events?.length || 0,
      liveEvents: liveCount,
      upcomingEvents: upcomingCount,
      totalRegistrations: regCount.count || 0,
      totalAttendance: attCount.count || 0,
      certificatesIssued: certCount.count || 0,
    },
  };
}

export default async function OrganizerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getOrganizerData(userId);

  if (!data) {
    return (
      <div className="container-page py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Become an Organizer</h1>
          <p className="text-slate-500 text-sm mb-6">
            You don't have an organizer profile yet. Contact admin to get approved as an event organizer.
          </p>
          <Link href="/" className="text-sm font-medium text-primary-600">Return Home</Link>
        </div>
      </div>
    );
  }

  const { organizer, events, stats } = data;

  const statCards = [
    { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "bg-primary-50 text-primary-600" },
    { label: "Live Now", value: stats.liveEvents, icon: Activity, color: "bg-red-50 text-red-600" },
    { label: "Upcoming", value: stats.upcomingEvents, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Registrations", value: stats.totalRegistrations, icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { label: "Attendance", value: stats.totalAttendance, icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
    { label: "Certificates", value: stats.certificatesIssued, icon: Award, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="container-page py-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizer Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {organizer.display_name || "Your Events"}
            {!organizer.approved && (
              <span className="ml-2 text-orange-500 font-medium">• Pending approval</span>
            )}
          </p>
        </div>
        <Link
          href="/organizer/events/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Events</h2>
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">You haven't created any events yet.</p>
            <Link
              href="/organizer/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {event.computed_status === "LIVE" && <LiveBadge size="sm" />}
                      <StatusBadge status={event.computed_status} compact />
                      {!event.approved && event.status !== "draft" && (
                        <span className="text-xs text-orange-500 font-medium">Pending approval</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900 text-sm truncate">{event.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(event.start_at, "MMM d, yyyy · h:mm a")}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/events/${event.slug}`}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View event"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Manage event"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/organizer/events/${event.id}/scan`}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Scan attendance"
                    >
                      <QrCode className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
