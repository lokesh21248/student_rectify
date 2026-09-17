import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { Building2, MapPin, Globe, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Partner Colleges — Admin Portal",
};

export default async function AdminCollegesPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN", "COLLEGE_MANAGER"]);

  const supabase = createAdminClient();
  const { data: dbColleges } = await supabase
    .from("colleges")
    .select("*")
    .order("name");

  const colleges = dbColleges || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Colleges</h2>
        <p className="text-sm text-slate-500">
          Institutions registered on the EduEvents ecosystem host and verify campus events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {colleges.map((col: any) => (
          <div
            key={col.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">{col.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{col.city || "India"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>ID: {col.slug || col.id.slice(0, 8)}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md font-sans">
                Active Partner
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
