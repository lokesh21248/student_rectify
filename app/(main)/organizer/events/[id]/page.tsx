import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate, computeEventStatus } from "@/lib/utils";
import { StatusBadge } from "@/components/events/LiveBadge";
import { LiveBadge } from "@/components/events/LiveBadge";
import {
  Eye, QrCode, Upload, Award, Users, CheckCircle2,
  ArrowLeft, Edit, FileText, BarChart3,
} from "lucide-react";
import { GenerateCertificatesButton } from "./GenerateCertificatesButton";

export const metadata: Metadata = { title: "Manage Event" };

export default async function ManageEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: eventId } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) redirect("/organizer");

  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      organizers!organizer_id(id, user_id),
      categories!category_id(name, color)
    `)
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  // Verify ownership (or admin)
  const isAdmin = ["college_admin", "super_admin"].includes(profile.role);
  if (!isAdmin && event.organizers?.user_id !== profile.id) {
    redirect("/organizer");
  }

  const status = computeEventStatus(event.start_at, event.end_at, event.status, event.approved);

  const [regRes, attRes, certRes] = await Promise.all([
    supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", eventId).eq("status", "registered"),
    supabase.from("event_attendance").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("event_id", eventId),
  ]);

  const registrationCount = regRes.count ?? 0;
  const attendanceCount = attRes.count ?? 0;
  const certificateCount = certRes.count ?? 0;

  // Recent registrations
  const { data: recentRegs } = await supabase
    .from("event_registrations")
    .select("registration_number, created_at, name, email")
    .eq("event_id", eventId)
    .eq("status", "registered")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="container-page py-8 page-enter">
      {/* Back */}
      <Link
        href="/organizer"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {status === "LIVE" && <LiveBadge />}
            <StatusBadge status={status} />
            {!event.approved && event.status === "published" && (
              <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                Pending Approval
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{formatDate(event.start_at, "EEEE, MMM d, yyyy · h:mm a")}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Registered", value: registrationCount, icon: Users, color: "text-primary-600 bg-primary-50" },
          { label: "Attended", value: attendanceCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Certificates", value: certificateCount, icon: Award, color: "text-amber-600 bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href={`/organizer/events/${eventId}/scan`}
          className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-primary-200 transition-colors"
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <QrCode className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Scan Attendance</p>
            <p className="text-xs text-slate-500">Mark participant check-ins</p>
          </div>
        </Link>

        {event.has_certificate && (status === "COMPLETED" || attendanceCount > 0) && (
          <GenerateCertificatesButton eventId={eventId} />
        )}

        <Link
          href={`/organizer/events/${eventId}/edit`}
          className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-primary-200 transition-colors"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Edit className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Edit Event</p>
            <p className="text-xs text-slate-500">Update event details</p>
          </div>
        </Link>
      </div>

      {/* Recent registrations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-slate-900">Recent Registrations</h2>
          <span className="text-xs text-slate-400">({registrationCount} total)</span>
        </div>

        {(recentRegs || []).length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No registrations yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {(recentRegs || []).map((reg: any) => (
                <div key={reg.registration_number} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{reg.name || "—"}</p>
                    <p className="text-xs text-slate-400">{reg.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-600">{reg.registration_number}</p>
                    <p className="text-xs text-slate-400">{formatDate(reg.created_at, "MMM d, h:mm a")}</p>
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
