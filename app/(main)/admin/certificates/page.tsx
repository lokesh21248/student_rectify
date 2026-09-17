import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { Award, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Certificates — Admin Portal",
};

export default async function AdminCertificatesPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"]);

  const supabase = createAdminClient();
  const [adminCertsRes, regularCertsRes] = await Promise.all([
    supabase.from("admin_certificates").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const certificates = [
    ...(adminCertsRes.data || []),
    ...(regularCertsRes.data || []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Issued Certificates</h2>
        <p className="text-sm text-slate-500">
          Verifiable credentials generated with tamper-proof certificate identifiers and QR authentication.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Verification ID</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No certificates issued yet.
                  </td>
                </tr>
              ) : (
                certificates.map((cert: any) => (
                  <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div>{cert.recipient_name || cert.student_name || "Participant"}</div>
                          <div className="text-xs text-slate-400">{cert.recipient_email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {cert.event_title || cert.event_name || "Event Award"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(cert.created_at || cert.issued_at, "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {cert.certificate_number || cert.certificate_id || cert.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
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
