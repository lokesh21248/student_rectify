"use client";

import { useState } from "react";
import Image from "next/image";
import { QrCode, Download, CheckCircle2 } from "lucide-react";
import QRCode from "react-qr-code";
import { buildQRData } from "@/lib/utils";

interface QRDisplayProps {
  registrationId: string;
  registrationNumber: string;
  eventTitle: string;
  userId?: string;
  eventId?: string;
}

export function QRDisplay({
  registrationId,
  registrationNumber,
  eventTitle,
  userId = "",
  eventId = "",
}: QRDisplayProps) {
  const qrData = buildQRData(registrationId, eventId, userId) || registrationId;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <QrCode className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">Your Event Pass</p>
      </div>

      {/* QR Code */}
      <div className="inline-block p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
        <QRCode
          value={qrData}
          size={160}
          level="M"
          fgColor="#0f172a"
          bgColor="#ffffff"
        />
      </div>

      {/* Registration number */}
      <p className="text-xs text-slate-500 mb-0.5">Registration ID</p>
      <p className="text-sm font-bold text-slate-900 font-mono tracking-wider mb-3">
        {registrationNumber}
      </p>

      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Show this QR at the event entrance</span>
      </div>
    </div>
  );
}
