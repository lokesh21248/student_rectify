import type { Metadata } from "next";
import { getCertificateByNumber } from "@/lib/supabase/queries";
import { createAdminClient } from "@/lib/supabase/server";
import { CheckCircle2, XCircle, Award, Calendar, Building, User, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/navigation/Footer";

interface VerifyPageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { certificateId } = await params;
  return {
    title: `Certificate Verification — ${certificateId}`,
    description: "Verify the authenticity of this event participation certificate.",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificateId } = await params;
  const certificate = await getCertificateByNumber(certificateId);

  // Log verification (audit)
  if (certificate?.id && !certificate.id.startsWith("cert-demo")) {
    try {
      const supabase = createAdminClient();
      await supabase.from("certificate_verifications").insert({
        certificate_id: certificate.id,
      });
    } catch {}
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="container-page flex items-center justify-center">
          {!certificate ? (
            <div className="bg-white rounded-[24px] border border-red-200/80 shadow-sm p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Certificate Not Found</h1>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                The certificate ID <code className="font-mono font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{certificateId}</code> could not be verified in the registry. It may have expired, been revoked, or entered incorrectly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/verify"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Try Another ID</span>
                </Link>
                <Link
                  href="/events"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Explore Events
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-emerald-200/80 shadow-elevated p-6 sm:p-8 max-w-lg w-full">
              {/* Verified badge */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Authentic</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Official Certificate</h1>
                <p className="text-slate-500 text-xs mt-1">Issued and recorded on EduEvents platform</p>
              </div>

              {/* Certificate details */}
              <div className="py-6 space-y-4">
                <DetailRow
                  icon={User}
                  label="Participant"
                  value={(certificate as any).profiles?.name || (certificate as any).recipient_name || "Aarav Sharma"}
                />
                <DetailRow
                  icon={Award}
                  label="Event"
                  value={(certificate as any).events?.title || (certificate as any).event_title || "National Event"}
                />
                {((certificate as any).events?.organizers?.display_name || (certificate as any).organizer_name) && (
                  <DetailRow
                    icon={Building}
                    label="Organizer"
                    value={(certificate as any).events?.organizers?.display_name || (certificate as any).organizer_name}
                  />
                )}
                {((certificate as any).events?.colleges?.name || (certificate as any).college_name) && (
                  <DetailRow
                    icon={Building}
                    label="Institution / Host"
                    value={(certificate as any).events?.colleges?.name || (certificate as any).college_name}
                  />
                )}
                {(certificate as any).events?.start_at && (
                  <DetailRow
                    icon={Calendar}
                    label="Event Date"
                    value={formatDate((certificate as any).events.start_at, "MMMM d, yyyy")}
                  />
                )}
                <DetailRow
                  icon={Calendar}
                  label="Issued On"
                  value={
                    (certificate as any).issued_at || (certificate as any).issue_date || (certificate as any).created_at
                      ? formatDate((certificate as any).issued_at || (certificate as any).issue_date || (certificate as any).created_at, "MMMM d, yyyy")
                      : "September 12, 2026"
                  }
                />
              </div>

              {/* Certificate ID */}
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/60 mb-6">
                <p className="text-xs text-slate-400 mb-1 font-medium">Certificate Identifier</p>
                <p className="font-mono font-bold text-slate-900 tracking-wider text-sm">
                  {certificate.certificate_number}
                </p>
              </div>

              {/* Verification count */}
              <p className="text-xs text-center text-slate-400 mb-6">
                This certificate has been verified {((certificate as any).verified_count || 0) + 1} time
                {((certificate as any).verified_count || 0) + 1 !== 1 ? "s" : ""}.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-100">
                <Link
                  href="/verify"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify Another</span>
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to EduEvents</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
