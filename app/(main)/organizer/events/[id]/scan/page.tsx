import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { QRScannerClient } from "./QRScannerClient";

export const metadata: Metadata = { title: "Scan Attendance" };

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: eventId } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, start_at, end_at, status")
    .eq("id", eventId)
    .single();

  if (!event) redirect("/organizer");

  return (
    <div className="container-page py-8 page-enter max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Scan Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">{event.title}</p>
      </div>
      <QRScannerClient eventId={event.id} eventTitle={event.title} />
    </div>
  );
}
