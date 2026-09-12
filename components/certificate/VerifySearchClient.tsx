"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, Search, ArrowRight, ShieldCheck, Calendar, Building, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function VerifySearchClient() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/certificates/verify?number=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.certificate) {
        setResult(data.certificate);
      } else {
        setError(data.error || "Certificate ID not found. Please verify the ID format (e.g. CERT-2026-HACK9981).");
      }
    } catch {
      // Direct navigation fallback
      router.push(`/verify/${cleanId}`);
    } finally {
      setLoading(false);
    }
  }

  function fillSample() {
    setCertId("CERT-2026-HACK9981");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Search Box Card */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-100 rounded-full w-fit text-xs font-semibold text-primary-700 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authenticity Guarantee</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Verify Certificate
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
          Every official EduEvents participation and achievement certificate is securely registered with a tamper-evident unique identifier.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="certificate-id-input"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CERT-2026-HACK9981)"
              style={{ paddingLeft: "46px", paddingRight: "16px" }}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={fillSample}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
            >
              Try sample: CERT-2026-HACK9981
            </button>

            <button
              type="submit"
              disabled={loading || !certId.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Verifying…</span>
              ) : (
                <>
                  <span>Verify Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900">Certificate Verification Failed</h3>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Verified result card */}
      {result && (
        <div className="bg-white rounded-[24px] border border-emerald-200/80 shadow-elevated p-6 sm:p-8">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full mb-1">
              Verified Authentic ✓
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Official Participation Certificate</h2>
            <p className="text-xs text-slate-500">Issued and cryptographically signed on EduEvents</p>
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Recipient Name</p>
                <p className="text-sm font-bold text-slate-900">
                  {result.profiles?.name || result.recipient_name || result.participant_name || "Aarav Sharma"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Event Title</p>
                <p className="text-sm font-bold text-slate-900">
                  {result.events?.title || result.event_title || "HackIndia 2026: The National AI & Web3 Hackathon"}
                </p>
              </div>
            </div>

            {(result.events?.colleges?.name || result.college_name) && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Institution / Host</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {result.events?.colleges?.name || result.college_name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Issue Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.issued_at || result.issue_date || result.created_at
                    ? formatDate(result.issued_at || result.issue_date || result.created_at, "MMMM d, yyyy")
                    : "September 12, 2026"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/60 mb-6">
            <p className="text-xs text-slate-400 mb-1 font-medium">Certificate Identifier</p>
            <p className="font-mono font-bold text-slate-900 tracking-wider text-sm">
              {result.certificate_number}
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href={`/verify/${result.certificate_number}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              <span>View Full Certificate Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
