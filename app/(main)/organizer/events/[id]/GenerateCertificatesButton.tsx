"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateCertificatesButtonProps {
  eventId: string;
}

export function GenerateCertificatesButton({ eventId }: GenerateCertificatesButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!confirm("Generate certificates for all attended participants? Existing certificates will not be overwritten.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate certificates");
      }

      toast.success(data.message || `Successfully generated ${data.generated ?? 0} certificate(s)!`);
      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong generating certificates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-amber-200 transition-colors text-left disabled:opacity-60"
    >
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        ) : (
          <Award className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">
          {loading ? "Issuing Certificates..." : "Issue Certificates"}
        </p>
        <p className="text-xs text-slate-500">Auto-issue to all attended students</p>
      </div>
    </button>
  );
}
