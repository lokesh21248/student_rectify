"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QrCode, CheckCircle2, AlertCircle, User, Clock, Camera } from "lucide-react";

interface QRScannerClientProps {
  eventId: string;
  eventTitle: string;
}

interface ScanResult {
  success: boolean;
  participant?: { name: string; email: string };
  registrationNumber?: string;
  error?: string;
  alreadyCheckedIn?: boolean;
  checkedInAt?: string;
}

export function QRScannerClient({ eventId, eventTitle }: QRScannerClientProps) {
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [recentScans, setRecentScans] = useState<Array<{ name: string; time: string; success: boolean }>>([]);

  async function processQR(qrData: string) {
    if (scanning) return;
    setScanning(true);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });

      const data = await res.json();

      if (res.ok) {
        const result: ScanResult = {
          success: true,
          participant: data.participant,
          registrationNumber: data.registrationNumber,
        };
        setLastResult(result);
        setCheckedInCount((c) => c + 1);
        setRecentScans((prev) => [
          { name: data.participant?.name || "Unknown", time: new Date().toLocaleTimeString(), success: true },
          ...prev.slice(0, 9),
        ]);
        toast.success(`✓ ${data.participant?.name || "Participant"} checked in!`);
      } else if (res.status === 409 && data.alreadyCheckedIn) {
        setLastResult({
          success: false,
          alreadyCheckedIn: true,
          checkedInAt: data.checkedInAt,
          participant: data.participant,
          error: "Already checked in",
        });
        toast.warning(`${data.participant?.name || "Participant"} already checked in`);
      } else {
        setLastResult({ success: false, error: data.error || "Scan failed" });
        toast.error(data.error || "Invalid QR code");
        setRecentScans((prev) => [
          { name: "Unknown", time: new Date().toLocaleTimeString(), success: false },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (err) {
      setLastResult({ success: false, error: "Network error" });
      toast.error("Network error. Try again.");
    } finally {
      setScanning(false);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processQR(manualInput.trim());
    setManualInput("");
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">{checkedInCount}</p>
          <p className="text-xs text-slate-500 mt-1">Checked In This Session</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${scanning ? "bg-amber-500 live-dot" : "bg-slate-300"}`} />
            <p className="text-sm font-semibold text-slate-700">{scanning ? "Processing…" : "Ready to Scan"}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Scanner Status</p>
        </div>
      </div>

      {/* Manual QR input */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Manual QR Entry</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Paste or type the QR code data from the participant's registration pass.
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder='Paste QR data: {"rid":"...","eid":"...","uid":"..."}'
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || scanning}
            className="px-5 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {scanning ? "…" : "Scan"}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> Use a barcode scanner device — it will automatically populate and submit the field above. Camera scanning requires a dedicated QR scanner app.
            </span>
          </div>
        </div>
      </div>

      {/* Last scan result */}
      <AnimatePresence mode="wait">
        {lastResult && (
          <motion.div
            key={lastResult.success ? "success" : "fail"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-2xl border p-5 shadow-sm ${
              lastResult.success
                ? "bg-emerald-50 border-emerald-200"
                : lastResult.alreadyCheckedIn
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {lastResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold text-sm ${
                  lastResult.success ? "text-emerald-800" :
                  lastResult.alreadyCheckedIn ? "text-amber-800" : "text-red-800"
                }`}>
                  {lastResult.success
                    ? "✓ Check-in Successful"
                    : lastResult.alreadyCheckedIn
                    ? "⚠ Already Checked In"
                    : "✗ " + lastResult.error}
                </p>
                {lastResult.participant?.name && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lastResult.participant.name}</p>
                      {lastResult.registrationNumber && (
                        <p className="text-xs text-slate-500 font-mono">{lastResult.registrationNumber}</p>
                      )}
                    </div>
                  </div>
                )}
                {lastResult.alreadyCheckedIn && lastResult.checkedInAt && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Checked in at {new Date(lastResult.checkedInAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Recent Scans</h3>
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${scan.success ? "bg-emerald-500" : "bg-red-400"}`} />
                  <span className="text-sm text-slate-700">{scan.name}</span>
                </div>
                <span className="text-xs text-slate-400">{scan.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
