import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { Users, Shield, UserCheck, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Users & RBAC — Admin Portal",
};

export default async function AdminUsersPage() {
  const session = await requireAdminRole(["SUPER_ADMIN", "ADMIN", "SUPPORT"]);

  const supabase = createAdminClient();
  let adminProfiles: any[] = [];

  try {
    const { data } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    adminProfiles = data || [];
  } catch {
    // Table not created yet
  }

  // Fallback / Current Admin
  if (adminProfiles.length === 0) {
    adminProfiles = [
      {
        id: "bootstrap-1",
        clerk_user_id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        status: "active",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User & Role Directory</h2>
          <p className="text-sm text-slate-500">
            Manage administrator assignments, team permissions, and role-based access control.
          </p>
        </div>
      </div>

      {/* Role explanation info box */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
        <div className="flex items-start gap-3 text-sm text-primary-900">
          <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-primary-900">Configured Role Hierarchy</h4>
            <p className="text-xs text-primary-800 leading-relaxed">
              <strong>SUPER_ADMIN</strong>: Full system privileges · <strong>ADMIN</strong>: Events, Colleges, Registrations, Categories, Certificates & Analytics · <strong>EVENT_MANAGER</strong>: Event operations & certificate issuance · <strong>COLLEGE_MANAGER</strong>: College directory & venue coordinator · <strong>SUPPORT</strong>: Read-only attendee & event lookups.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Profiles Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Authorized Administrators</h3>
          <span className="text-xs text-slate-500">{adminProfiles.length} Members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminProfiles.map((adm: any) => (
                <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                        {adm.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div>{adm.name || "Administrator"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{adm.clerk_user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {adm.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        adm.role === "SUPER_ADMIN"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : adm.role === "ADMIN"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {adm.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
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
