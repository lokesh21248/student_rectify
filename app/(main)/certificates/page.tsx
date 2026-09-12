import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Download, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserCertificates } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Certificates",
  description: "Download and share your event participation certificates.",
};

export default async function CertificatesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const certificates = await getUserCertificates(userId);

  return (
    <div className="container-page py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verified participation certificates from events you attended.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          type="no-certificates"
          action={{ label: "Find Events", href: "/events" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: any }) {
  const event = certificate.events;

  return (
    <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header decoration */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-yellow-500" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">
          {event?.title || "Event"}
        </h3>
        {event?.colleges?.name && (
          <p className="text-xs text-slate-500 mb-3">{event.colleges.name}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Calendar className="w-3 h-3" />
          <span>Issued {formatDate(certificate.issued_at)}</span>
        </div>

        <div className="bg-slate-50 rounded-xl px-3 py-2 mb-4">
          <p className="text-xs text-slate-500 mb-0.5">Certificate ID</p>
          <p className="text-xs font-bold text-slate-800 font-mono tracking-wider">
            {certificate.certificate_number}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/verify/${certificate.certificate_number}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Verify
          </Link>
          <Link
            href={`/api/certificates/${certificate.id}/download`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Link>
        </div>
      </div>
    </div>
  );
}
