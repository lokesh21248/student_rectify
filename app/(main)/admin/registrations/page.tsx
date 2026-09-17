import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { ClipboardList, CheckCircle2, Clock, Mail, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Event Registrations — Admin Portal",
};

export default async function AdminRegistrationsPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"]);

  const supabase = createAdminClient();
  const { data: dbRegistrations } = await supabase
    .from("event_registrations")
    .select("*, events!event_id(title, slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  const registrations = dbRegistrations || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Registrations</h2>
        <p className="text-sm text-slate-500">
          Monitor real-time attendee registrations, QR ticket status, and campus check-ins.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Event Title</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Ticket Code</th>
                <th className="px-6 py-4">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No student registrations found yet.
                  </td>
                </tr>
              ) : (
                registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{reg.student_name || "Student"}</div>
                      <div className="text-xs text-slate-400">{reg.student_email || "—"}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {reg.events?.title || "Event #" + reg.event_id?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(reg.created_at, "dd MMM yyyy, h:mm a")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {reg.ticket_code || reg.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          reg.checked_in || reg.status === "attended"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {reg.checked_in || reg.status === "attended" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Checked In</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Registered</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
