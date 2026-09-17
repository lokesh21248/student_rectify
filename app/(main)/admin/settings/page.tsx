import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { Settings, Shield, Key, Bell, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — Admin Portal",
};

export default async function AdminSettingsPage() {
  const session = await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Settings</h2>
        <p className="text-sm text-slate-500">
          Configure authentication, database connectivity, and administrative security preferences.
        </p>
      </div>

      {/* Authentication & Security Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Authentication & Identity</h3>
            <p className="text-xs text-slate-500">Managed via Clerk Next.js SDK</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Authentication Provider</div>
              <div className="text-xs text-slate-500">Clerk Enterprise Identity</div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
              Active & Protected
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Your Administrator Role</div>
              <div className="text-xs text-slate-500">Verified server-side via Clerk metadata & Supabase</div>
            </div>
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">
              {session.role}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Database Engine</div>
              <div className="text-xs text-slate-500">Supabase PostgreSQL with Row Level Security</div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
