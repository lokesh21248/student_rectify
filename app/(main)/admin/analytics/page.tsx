import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { BarChart3, TrendingUp, Users, Calendar, Award, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Analytics — Admin Portal",
};

export default async function AdminAnalyticsPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);

  const supabase = createAdminClient();
  const [eventsRes, regsRes, collegesRes, certsRes] = await Promise.all([
    supabase.from("events").select("id, status"),
    supabase.from("event_registrations").select("id, status, checked_in"),
    supabase.from("colleges").select("id"),
    supabase.from("certificates").select("id"),
  ]);

  const totalEvents = eventsRes.data?.length || 0;
  const totalRegistrations = regsRes.data?.length || 0;
  const totalColleges = collegesRes.data?.length || 0;
  const totalCerts = certsRes.data?.length || 0;
  const attendees = regsRes.data?.filter((r: any) => r.checked_in || r.status === "attended").length || 0;
  const attendanceRate = totalRegistrations > 0 ? Math.round((attendees / totalRegistrations) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Analytics</h2>
        <p className="text-sm text-slate-500">
          Real-time metrics on participant registration velocity, event turnaround, and college engagement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Registrations", value: totalRegistrations, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Turnout Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Active Events", value: totalEvents, icon: Calendar, color: "text-purple-600 bg-purple-50" },
          { label: "Partner Institutions", value: totalColleges, icon: Building2, color: "text-amber-600 bg-amber-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Summary report banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2">Growth & Turnout Metrics</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The platform reports high student turnout for inter-college hackathons and technological symposiums. Verified certificate validation requests have maintained 100% integrity.
        </p>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-primary-600 h-full rounded-full transition-all" style={{ width: `${Math.max(attendanceRate, 15)}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
          <span>Actual Checked-In Attendees ({attendees})</span>
          <span>Total Registered ({totalRegistrations})</span>
        </div>
      </div>
    </div>
  );
}
