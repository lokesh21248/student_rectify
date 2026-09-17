import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Plus, ExternalLink, MapPin, Users, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MOCK_EVENTS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Manage Events — Admin Portal",
};

export default async function AdminEventsPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"]);

  const supabase = createAdminClient();
  const { data: dbEvents } = await supabase
    .from("events")
    .select(`
      *,
      categories!category_id(id, name, color),
      colleges!college_id(id, name, city)
    `)
    .order("created_at", { ascending: false });

  const events = dbEvents && dbEvents.length > 0 ? dbEvents : MOCK_EVENTS;

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Events Management</h2>
          <p className="text-sm text-slate-500">
            View, review, and manage all events scheduled across campus partner institutions.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </Link>
      </div>

      {/* Events Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Event Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate max-w-xs font-semibold">{evt.title}</div>
                        <div className="text-xs text-slate-400 font-mono truncate">
                          {evt.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {evt.categories?.name || evt.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {formatDate(evt.start_at, "dd MMM yyyy, h:mm a")}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.city || evt.venue || "Campus"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        evt.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="capitalize">{evt.status || "Active"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/events/${evt.slug}`}
                      target="_blank"
                      className="p-2 text-slate-400 hover:text-primary-600 transition-colors inline-block"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
